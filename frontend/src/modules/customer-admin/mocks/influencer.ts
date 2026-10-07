import type {Campaign} from "../types/influencer";
export {creators} from "@/modules/creator-directory";
export const campaignProducts = [
  {id:'cardigan',name:'Oversize Kaşmir Triko Hırka',image:'/dropshipping/cardigan.jpg'},
  {id:'serum',name:'Organik C Vitamini Serum',image:'/dropshipping/serum.jpg'},
  {id:'stand',name:'Masaüstü Telefon Standı',image:'/dropshipping/phone-stand.jpg'},
];
export const campaignStatusLabels = {pending:'Onay Bekliyor',approved:'Onaylandı',shipped:'Kargoda',completed:'Tamamlandı',cancelled:'İptal Edildi'};
export const initialCampaigns: Campaign[] = [
  {id:'CMP-1001',creatorId:'melis',name:'Sonbahar Stil Seçkisi',kind:'paid',productId:'cardigan',quantity:1,fee:850000,commission:10,brief:'Ürünü günlük bir kombin içerisinde tanıtan bir Reels ve bir Story.',status:'shipped',createdAt:'2026-10-01T10:00:00Z'},
  {id:'CMP-1002',creatorId:'zeynep',name:'Bakım Rutini',kind:'gift',productId:'serum',quantity:1,fee:0,commission:8,brief:'Ürün deneyimini ve kullanım rutinini gösteren kısa bir içerik.',status:'pending',createdAt:'2026-10-02T09:00:00Z'},
];
