import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function sourceModule(relative) {
  const source=await readFile(new URL(relative,import.meta.url),"utf8");
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}});
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const {orderSubtotal,orderTotal,canAdvanceOrder,advanceOrder,ordersCsv}=await sourceModule("./order.ts");
const {demoOrders}=await sourceModule("../mocks/orders.ts");
test("order totals preserve integer cents and discounts",()=>{
  assert.equal(orderSubtotal(demoOrders[0]),212000);
  assert.equal(orderTotal(demoOrders[0]),190800);
  assert.equal(orderTotal({...demoOrders[0],shippingCents:3850}),194650);
});
test("unpaid or unlabeled orders cannot advance; terminal states stay terminal",()=>{
  const initial=demoOrders[0];
  assert.equal(canAdvanceOrder(initial),false);
  assert.equal(advanceOrder(initial),initial);
  const labeled={...initial,tracking:"DEMO-HA-9452"};
  assert.equal(advanceOrder(labeled).shipment,"shipped");
  assert.equal(advanceOrder({...labeled,payment:"pending"}).shipment,"preparing");
  const shipped=advanceOrder(labeled);
  assert.equal(advanceOrder(shipped).shipment,"delivered");
  const delivered=advanceOrder(shipped);
  assert.equal(advanceOrder(delivered),delivered);
  assert.equal(canAdvanceOrder({...labeled,shipment:"cancelled"}),false);
});
test("CSV neutralizes customer formulas and escapes quotes",()=>{
  const csv=ordersCsv([{...demoOrders[0],customer:'=SUM(1,2) "demo"'}]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'=SUM(1,2) ""demo"""'));
  assert.ok(csv.includes('"1908.00"'));
});
