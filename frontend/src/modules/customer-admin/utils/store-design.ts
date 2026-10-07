import { sectionKinds } from "../types/store-design";
import type { StoreDesign, DesignSection } from "../types/store-design";
export function youtubeVideoId(value:string):string|undefined {
  try {const url=new URL(value);if(url.protocol!=="https:")return;const id=url.hostname==="youtu.be"?url.pathname.slice(1):["youtube.com","www.youtube.com"].includes(url.hostname)&&url.pathname==="/watch"?url.searchParams.get("v"):null;return id&&/^[\w-]{11}$/.test(id)?id:undefined;}catch{return;}
}
export function isDesignImage(value:unknown):value is string {return typeof value==="string"&&value.length<2900000&&(/^\/(?:dropshipping|storefront)\/[a-zA-Z0-9/_-]+\.(?:png|jpg|webp)$/.test(value)||/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value));}
export function isStoreDesign(value:unknown):value is StoreDesign {
  if(!value||typeof value!=="object")return false;const d=value as Record<string,unknown>;
  if(!d.announcement||typeof d.announcement!=="object"||!d.hero||typeof d.hero!=="object")return false;
  const a=d.announcement as Record<string,unknown>,h=d.hero as Record<string,unknown>;
  const text=(v:unknown,max:number)=>typeof v==="string"&&v.length<=max;
  return typeof a.enabled==="boolean"&&text(a.text,160)&&["blue","ink","cream"].includes(String(a.tone))&&text(h.title,100)&&text(h.description,200)&&text(h.buttonLabel,40)&&isDesignImage(h.image)&&typeof d.accent==="string"&&/^#[\da-f]{6}$/i.test(d.accent)&&["white","beige"].includes(String(d.background))&&["jakarta","inter","serif"].includes(String(d.font))&&Array.isArray(d.sections)&&d.sections.length<=10&&new Set(d.sections.map((s:unknown)=>s&&typeof s==="object"?(s as Record<string,unknown>).kind:undefined)).size===d.sections.length&&new Set(d.sections.map((s:unknown)=>s&&typeof s==="object"?(s as Record<string,unknown>).id:undefined)).size===d.sections.length&&d.sections.every((v:unknown)=>{if(!v||typeof v!=="object")return false;const s=v as Record<string,unknown>;return text(s.id,70)&&sectionKinds.includes(s.kind as DesignSection["kind"])&&text(s.title,80)&&text(s.description,300)&&typeof s.visible==="boolean"&&text(s.videoUrl,250);});
}
export function designValidation(design:StoreDesign):string {
  if(!isStoreDesign(design))return "Vitrin ayarlarında geçersiz bir değer var.";
  if(design.announcement.enabled&&!design.announcement.text.trim())return "Duyuru metnini yazın veya duyuruyu kapatın.";
  if(design.sections.some(section=>section.kind==="hero"&&section.visible)&&(!design.hero.title.trim()||!design.hero.buttonLabel.trim()))return "Manşet başlığı ve buton metnini doldurun.";
  if(!design.sections.some(section=>section.visible))return "En az bir görünür bölüm bulunmalı.";
  if(design.sections.some(section=>section.visible&&!section.title.trim()))return "Görünür bölümlerin başlıklarını doldurun.";
  if(design.sections.some(section=>section.kind==="video"&&section.visible&&!youtubeVideoId(section.videoUrl)))return "Video bölümü için geçerli bir HTTPS YouTube bağlantısı ekleyin veya bölümü gizleyin.";
  return "";
}
export function moveSection(sections:DesignSection[],id:string,direction:-1|1):DesignSection[] {const index=sections.findIndex(section=>section.id===id),target=index+direction;if(index<0||target<0||target>=sections.length)return sections;const next=[...sections];[next[index],next[target]]=[next[target],next[index]];return next;}
export const designStorageKey=(slug:string,version:"draft"|"published")=>`alceix:store-design:${slug}:${version}`;

export function accentForeground(color:string):string {const hex=/^#[\da-f]{6}$/i.test(color)?color:"#0066ff";const channels=[1,3,5].map(offset=>{const c=parseInt(hex.slice(offset,offset+2),16)/255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;});const luminance=channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;return luminance>0.179?"#102039":"#ffffff";}
