export type ProfileIdentity = {name:string;slug:string;initials:string;storefrontSlug:string};
export type ProfileSettings = {name:string;company:string;slug:string;bio:string;instagram:string;tiktok:string;whatsapp:string;youtube:string;seoTitle:string;seoDescription:string;isOpen:boolean;mode:"normal"|"maintenance"|"holiday"};
export function isProfileSettings(value:unknown):value is ProfileSettings {
 if(!value||typeof value!=="object")return false;const v=value as Record<string,unknown>;
 const limits:Record<string,number>={name:120,company:150,slug:60,bio:300,instagram:40,tiktok:40,whatsapp:25,youtube:300,seoTitle:70,seoDescription:160};
 return Object.entries(limits).every(([key,max])=>typeof v[key]==="string"&&(v[key] as string).length<=max)&&typeof v.isOpen==="boolean"&&["normal","maintenance","holiday"].includes(String(v.mode));
}
