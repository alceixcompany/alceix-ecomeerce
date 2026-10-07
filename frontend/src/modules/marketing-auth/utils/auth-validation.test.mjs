import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('./auth-validation.ts',import.meta.url),'utf8');
const {referralIssue,recoveryEmailIssue}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
test('referral is optional and accepts bounded alphanumeric codes',()=>{for(const value of ['', '  ', 'ALCEIX-2026','abc',' ALC-123 '])assert.equal(referralIssue(value),'');for(const value of ['ab','@alice','A B C','A'.repeat(33)])assert.notEqual(referralIssue(value),'');});
test('recovery requires a valid bounded email address',()=>{assert.equal(recoveryEmailIssue('demo@example.com'),'');assert.equal(recoveryEmailIssue(' demo@example.com '),'');for(const value of ['', 'not-an-email','demo@', 'a b@example.com','a'.repeat(250)+'@example.com'])assert.notEqual(recoveryEmailIssue(value),'');});
