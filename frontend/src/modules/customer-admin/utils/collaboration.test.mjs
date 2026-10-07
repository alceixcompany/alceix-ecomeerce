import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
function compile(path){return ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;}
const dataUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const sharedCreators=dataUrl(compile('../../creator-directory/mocks/creators.ts'));
const influencerFixtures=compile('../mocks/influencer.ts').replaceAll(JSON.stringify('@/modules/creator-directory'),JSON.stringify(sharedCreators));
const source=compile('./collaboration.ts').replaceAll("'./profile'",JSON.stringify(dataUrl(compile('./profile.ts')))).replace("'../mocks/influencer'",JSON.stringify(dataUrl(influencerFixtures))).replace("'../mocks/suppliers'",JSON.stringify(dataUrl(compile('../mocks/suppliers.ts'))));
const rules=await import(dataUrl(source));
const owner={id:'owner',name:'Owner',email:'owner@example.com',role:'owner',status:'active'};
const applicant={creatorId:'melis',status:'accepted',note:'Örnek başvuru'};
const campaign={id:'1',title:'Demo',brief:'Ürün tanıtımı',format:'Reels',budgetCents:100000,deadline:'2026-11-15',slots:1,status:'open',applications:[applicant]};
test('team requires one active owner and unique invitation addresses',()=>{assert.equal(rules.isTeam([owner]),true);assert.equal(rules.isTeam([]),false);assert.equal(rules.isTeam([owner,{...owner,id:'second'}]),false);assert.equal(rules.isTeam([owner,{...owner,id:'second',role:'viewer',email:'OWNER@example.com'}]),false);assert.equal(rules.isTeam([null]),false);});
test('campaign applications enforce valid creators, capacity and unique applicants',()=>{assert.equal(rules.isOpenCampaigns([campaign]),true);assert.equal(rules.isOpenCampaigns([{...campaign,applications:[applicant,{...applicant,creatorId:'caner'}]}]),false);assert.equal(rules.isOpenCampaigns([{...campaign,applications:[{...applicant,creatorId:'unknown'}]}]),false);assert.equal(rules.isOpenCampaigns([{...campaign,applications:[null]}]),false);assert.equal(rules.isOpenCampaigns([{...campaign,applications:[applicant,applicant]}]),false);});
test('messages validate recipients and reject external contact sharing',()=>{const message={id:'1',thread:'creator:melis',text:'Ürün detay çekimlerini planlayalım.',createdAt:'2026-10-02T10:00:00Z'};assert.equal(rules.isMessages([message]),true);for(const text of ['https://example.com','kisi@example.com','+90 532 123 45 67','WhatsApp üzerinden yaz'])assert.equal(rules.containsExternalContact(text),true);assert.equal(rules.isMessages([{...message,thread:'supplier:unknown'}]),false);assert.equal(rules.isMessages([{...message,text:'www.example.com'}]),false);});
test('reviews reject out-of-range stars, malformed records and duplicate supplier reviews',()=>{const review={supplierId:'modatekstil',storeName:'Demo',rating:5,text:'Güzel koleksiyon',createdAt:'2026-10-02T10:00:00Z'};assert.equal(rules.isReviews([review]),true);assert.equal(rules.isReviews([null]),false);assert.equal(rules.isReviews([{...review,rating:6}]),false);assert.equal(rules.isReviews([review,review]),false);});
test('sale price overrides require a known supplier product and positive integer cents',()=>{assert.equal(rules.isPrices({'modatekstil:urun-1':79500}),true);for(const value of [0,-1,79500.5,'79500'])assert.equal(rules.isPrices({'modatekstil:urun-1':value}),false);assert.equal(rules.isPrices({'unknown:urun-1':79500}),false);});
test('email queue rejects malformed recipient lists',()=>{const job={id:'1',subject:'Sepetiniz',body:'Merhaba',recipients:['demo@example.com'],createdAt:'2026-10-02T10:00:00Z'};assert.equal(rules.isEmailJobs([job]),true);assert.equal(rules.isEmailJobs([{...job,recipients:['invalid']}]),false);assert.equal(rules.isEmailJobs([null]),false);});

test('thread IDs cannot append unvalidated route or recipient suffixes',()=>{assert.equal(rules.isThread('creator:melis'),true);assert.equal(rules.isThread('creator:melis:extra'),false);assert.equal(rules.isThread('supplier:modatekstil'),true);});
