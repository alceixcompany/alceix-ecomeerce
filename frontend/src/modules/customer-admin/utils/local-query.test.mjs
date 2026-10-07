import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('./local-query.ts',import.meta.url),'utf8');
const {localQueryTarget}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
const current='http://localhost:3012/firmaadi/admin/musteriler?q=Selin';
test('local filtering preserves the current route and encoded query/hash',()=>{assert.equal(localQueryTarget('?q=%C4%B0pek&page=2#list',current),'/firmaadi/admin/musteriler?q=%C4%B0pek&page=2#list');assert.equal(localQueryTarget('/firmaadi/admin/musteriler',current),'/firmaadi/admin/musteriler');});
test('local filtering cannot navigate to another store, page or origin',()=>{for(const target of ['/luma-studio/admin/musteriler','/firmaadi/admin/urunler','https://example.com/firmaadi/admin/musteriler','//example.com'])assert.equal(localQueryTarget(target,current),undefined);});
