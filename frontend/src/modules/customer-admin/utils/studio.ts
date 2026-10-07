import type { StudioSettings, StudioState } from '../types/studio';
export const studioCost=8;
export function isStudioImage(value:unknown):value is string {return typeof value==='string'&&value.length<2900000&&(/^\/(dropshipping|influencer|storefront\/gallery|about|marketing|supplier)\/[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp)$/.test(value)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value));}
export function isStudioSettings(value:unknown):value is StudioSettings {
 if(!value||typeof value!=='object')return false;const s=value as StudioSettings;
 return ['model','scene','upscale'].includes(s.mode)&&['Kadın','Erkek','Unisex'].includes(s.gender)&&['Doğal Görünüm','Klasik Stil','Modern Stil','Editoryal'].includes(s.appearance)&&['S (36)','M (38–40)','L (42–44)','XL (46)'].includes(s.size)&&['20–24','25–32','35–45'].includes(s.age)&&['Doğal Ayakta','Yürüyüş','Kumaş Detayı','Oturur Poz'].includes(s.pose)&&['sunlight','street','white','coast'].includes(s.scene)&&['4:5','1:1','9:16'].includes(s.ratio)&&typeof s.prompt==='string'&&s.prompt.trim().length>0&&s.prompt.length<=600;
}
export function isStudioState(value:unknown):value is StudioState {
 if(!value||typeof value!=='object')return false;const s=value as StudioState;
 if(!Number.isSafeInteger(s.credits)||s.credits<0||s.credits>10000||!Array.isArray(s.entries)||s.entries.length>30)return false;
 const ids=new Set<string>();return s.entries.every(e=>{if(!e||typeof e!=='object'||typeof e.id!=='string'||!/^ST-[a-zA-Z0-9-]+$/.test(e.id)||ids.has(e.id))return false;ids.add(e.id);return typeof e.productId==='string'&&e.productId.length<150&&typeof e.productName==='string'&&e.productName.length<=200&&isStudioImage(e.source)&&Array.isArray(e.variants)&&e.variants.length===4&&e.variants.every(isStudioImage)&&typeof e.createdAt==='string'&&Number.isFinite(Date.parse(e.createdAt))&&isStudioSettings(e.settings);});
}
export function generationIssue(credits:number,count:number,hasSource:boolean,validSettings:boolean){if(!hasSource)return 'Önce geçerli bir ürün görseli seçin.';if(!validSettings)return 'Sahne açıklamasını ve üretim ayarlarını kontrol edin.';if(!Number.isInteger(count)||count<1||count>3)return 'Toplu üretim için 1–3 ürün seçin.';if(credits<count*studioCost)return 'Demo krediniz yetersiz. Demo kredi ekleyebilirsiniz.';return '';}
export function uploadImageIssue(mime:string,size:number){if(!['image/png','image/jpeg','image/webp'].includes(mime))return 'PNG, JPG veya WebP görsel seçin.';if(size<=0||size>2*1024*1024)return 'Görsel en fazla 2 MB olmalı.';return '';}
