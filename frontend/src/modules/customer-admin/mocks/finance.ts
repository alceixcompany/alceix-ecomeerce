import type { BankAccount, FinanceTransaction } from "../types/finance";
export const demoBank: BankAccount = {owner:"Heer Tasarım ve Tekstil Ltd. Şti.",bank:"Garanti BBVA",iban:"TR200000000000000000000001"};
export const financeTransactions:FinanceTransaction[] = [
  {id:"HA-9421",title:"Sipariş #HA-9421",detail:"Oversize Triko Hırka ×2",date:"2026-10-02T14:15:00+03:00",type:"sale",method:"Kredi Kartı",grossCents:178000,commissionCents:5340,netCents:172660},
  {id:"AKT-3492",title:"Haftalık Otomatik IBAN Aktarımı",detail:"Örnek banka hesabı",date:"2026-09-28T10:00:00+03:00",type:"transfer",method:"EFT / Havale",grossCents:-2840000,commissionCents:0,netCents:-2840000},
  {id:"HA-9418",title:"Sipariş #HA-9418",detail:"Minimal Deri Kartlık",date:"2026-09-18T16:30:00+03:00",type:"sale",method:"Kredi Kartı",grossCents:145000,commissionCents:4350,netCents:140650},
  {id:"HA-9405",title:"Sipariş #HA-9405",detail:"Doğal Dokulu Triko Hırka",date:"2026-09-17T11:20:00+03:00",type:"sale",method:"Havale / EFT",grossCents:74000,commissionCents:2220,netCents:71780},
  {id:"IAD-102",title:"İade & Mahsup #IAD-102",detail:"Sipariş #HA-9390 örnek iade kaydı",date:"2026-09-15T09:40:00+03:00",type:"refund",method:"İade",grossCents:-62000,commissionCents:-1860,netCents:-60140},
  {id:"HA-9398",title:"Sipariş #HA-9398",detail:"Meşe Telefon Standı",date:"2026-09-14T12:20:00+03:00",type:"sale",method:"Kredi Kartı",grossCents:38000,commissionCents:1140,netCents:36860},
  {id:"HA-9395",title:"Sipariş #HA-9395",detail:"Günlük Bakım Serumu",date:"2026-08-22T10:30:00+03:00",type:"sale",method:"Kredi Kartı",grossCents:34000,commissionCents:1020,netCents:32980},
  {id:"AKT-3470",title:"Haftalık IBAN Aktarımı",detail:"Örnek banka hesabı",date:"2026-08-17T10:00:00+03:00",type:"transfer",method:"EFT / Havale",grossCents:-1240000,commissionCents:0,netCents:-1240000},
];
