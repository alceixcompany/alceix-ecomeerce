import type { Campaign, CampaignStatus, Creator } from '../types/influencer';
export function filterCreators(creators: Creator[], filters: Record<string,string>) {
  const result=creators.filter(c=>(!filters.q||`${c.name} ${c.handle} ${c.description}`.toLocaleLowerCase('tr-TR').includes(filters.q.toLocaleLowerCase('tr-TR')))&&(!filters.platform||c.platform===filters.platform)&&(!filters.category||c.category===filters.category)&&(!filters.audience||c.audience===filters.audience)&&(!filters.followers||(filters.followers==='micro'?c.followers<200000:c.followers>=200000))&&(!filters.kind||(filters.kind==='gift'?c.fee===0:c.fee>0)));
  return result.sort((a,b)=>filters.sort==='followers'?b.followers-a.followers:filters.sort==='fee'?a.fee-b.fee:b.engagement-a.engagement);
}
export function campaignIssue(c: Omit<Campaign,'id'|'createdAt'|'status'>) {
  if(!c.name.trim()||c.name.length>100) return 'Kampanya adı 1–100 karakter olmalı.';
  if(!c.brief.trim()||c.brief.length>1000) return 'İçerik beklentinizi 1–1000 karakterle açıklayın.';
  if(!Number.isInteger(c.quantity)||c.quantity<1||c.quantity>5) return 'Ürün adedi 1–5 arasında olmalı.';
  if(!Number.isSafeInteger(c.fee)||c.fee<0||c.fee>10000000||(c.kind==='gift'&&c.fee!==0)) return 'Geçerli bir teklif tutarı girin (en fazla ₺100.000).';
  if(!Number.isInteger(c.commission)||c.commission<0||c.commission>30) return 'Komisyon %0–30 arasında olmalı.';
  return '';
}
export function nextCampaignStatus(status: CampaignStatus): CampaignStatus | undefined {return ({pending:'approved',approved:'shipped',shipped:'completed'} as Partial<Record<CampaignStatus,CampaignStatus>>)[status];}
export function isCampaigns(value: unknown, creatorIds: string[], productIds: string[]): value is Campaign[] {
  if(!Array.isArray(value)||value.length>100) return false;
  const ids=new Set<string>();
  return value.every(v=>{if(!v||typeof v!=='object')return false;const c=v as Campaign;
    if(typeof c.id!=='string'||!/^CMP-[a-zA-Z0-9-]+$/.test(c.id)||ids.has(c.id))return false;ids.add(c.id);
    return creatorIds.includes(c.creatorId)&&productIds.includes(c.productId)&&['gift','paid'].includes(c.kind)&&['pending','approved','shipped','completed','cancelled'].includes(c.status)&&typeof c.name==='string'&&typeof c.brief==='string'&&typeof c.createdAt==='string'&&Number.isFinite(Date.parse(c.createdAt))&&!campaignIssue(c);
  });
}
export function csvCell(value: string) {return '"'+value.replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')+'"';}
