import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function moduleUrl(relative, replacements={}) {
  const source=await readFile(new URL(relative,import.meta.url),"utf8");
  let {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}});
  for(const [path,url] of Object.entries(replacements))outputText=outputText.replaceAll(`"${path}"`,`"${url}"`);
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const typesUrl=await moduleUrl("../types/store-design.ts");
const utils=await import(await moduleUrl("./store-design.ts",{"../types/store-design":typesUrl}));
const {initialStoreDesign}=await import(await moduleUrl("../mocks/store-design.ts"));
test("saved design validation rejects unsafe resources and duplicate sections",()=>{
  const d=initialStoreDesign();assert.equal(utils.isStoreDesign(d),true);
  assert.equal(utils.isStoreDesign({...d,hero:{...d.hero,image:"javascript:alert(1)"}}),false);
  assert.equal(utils.isStoreDesign({...d,hero:{...d.hero,image:"https://unknown.example/photo.jpg"}}),false);
  assert.equal(utils.isStoreDesign({...d,sections:[...d.sections,{...d.sections[0],id:"other"}]}),false);
  assert.equal(utils.isStoreDesign({...d,accent:"url(https://unknown.example)"}),false);
  assert.equal(utils.isStoreDesign({...d,font:"unsupported"}),false);
});
test("reordering preserves sections and safely stops at list boundaries",()=>{
  const d=initialStoreDesign();assert.equal(utils.moveSection(d.sections,"hero",-1),d.sections);
  const next=utils.moveSection(d.sections,"hero",1);assert.equal(next[1].id,"hero");assert.equal(d.sections[0].id,"hero");
  assert.deepEqual(new Set(next.map(s=>s.id)),new Set(d.sections.map(s=>s.id)));
});
test("publishing requires visible content and a valid video link",()=>{
  const d=initialStoreDesign();assert.equal(utils.designValidation(d),"");
  assert.notEqual(utils.designValidation({...d,sections:d.sections.map(s=>({...s,visible:false}))}),"");
  assert.notEqual(utils.designValidation({...d,announcement:{...d.announcement,text:""}}),"");
  const video={id:"video",kind:"video",title:"Video",description:"",visible:true,videoUrl:"https://unknown.example/video"};
  assert.notEqual(utils.designValidation({...d,sections:[...d.sections,video]}),"");
  assert.equal(utils.designValidation({...d,sections:[...d.sections,{...video,visible:false}]}),"");
});
test("video host, tenant scopes and contrasting text are constrained",()=>{
  assert.equal(utils.youtubeVideoId("https://youtu.be/ABCDEFGHIJK"),"ABCDEFGHIJK");
  assert.equal(utils.youtubeVideoId("https://youtube.com/watch?v=ABCDEFGHIJK"),"ABCDEFGHIJK");
  assert.equal(utils.youtubeVideoId("https://youtube.com.evil.example/watch?v=ABCDEFGHIJK"),undefined);
  assert.equal(utils.youtubeVideoId("javascript:alert(1)"),undefined);
  assert.equal(utils.youtubeVideoId("http://youtu.be/ABCDEFGHIJK"),undefined);
  assert.notEqual(utils.designStorageKey("firmaadi","draft"),utils.designStorageKey("luma-studio","draft"));
  assert.notEqual(utils.designStorageKey("firmaadi","draft"),utils.designStorageKey("firmaadi","published"));
  assert.equal(utils.accentForeground("#ffffff"),"#102039");assert.equal(utils.accentForeground("#000000"),"#ffffff");
});
