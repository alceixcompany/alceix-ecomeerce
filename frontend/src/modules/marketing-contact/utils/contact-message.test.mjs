import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const compile = path => ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const asModule = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const config = asModule(compile('../config/contact.ts'));
const source = compile('./contact-message.ts').replace('"../config/contact"', JSON.stringify(config));
const { validateContactMessage, contactMailto } = await import(asModule(source));
const valid = { name: 'Demo Kullanıcı', email: 'demo@example.com', phone: '', store: '', topic: 'store', message: 'Mağaza kurulumu hakkında bilgi almak istiyorum.', consent: true };
test('optional fields may be blank, but consent and message are required', () => {
  assert.deepEqual(validateContactMessage(valid), {});
  const errors = validateContactMessage({ ...valid, name: ' ', email: 'bad', message: 'short', consent: false });
  assert.deepEqual(Object.keys(errors).sort(), ['consent', 'email', 'message', 'name']);
});
test('rejects unknown topics, oversized data and invalid phone numbers', () => {
  for (const [key, value] of [['topic', 'unknown'], ['message', 'a'.repeat(3001)], ['store', 'a'.repeat(201)], ['phone', 'not-a-phone'], ['email', 'a'.repeat(250) + '@example.com']]) {
    assert.ok(validateContactMessage({ ...valid, [key]: value })[key]);
  }
  assert.deepEqual(validateContactMessage({ ...valid, phone: '+90 (532) 123 45 67' }), {});
});
test('email draft safely encodes user text and keeps the recipient fixed', () => {
  const url = contactMailto({ ...valid, message: 'Ürün & ödeme? #detay\nYeni satır &bcc=other@example.com' });
  assert.ok(url.startsWith('mailto:destek@alceix.com?'));
  const params = new URLSearchParams(url.split('?')[1]);
  assert.equal(params.size, 2);
  assert.ok(params.get('body').includes('&bcc=other@example.com'));
  assert.equal(params.get('bcc'), null);
});
