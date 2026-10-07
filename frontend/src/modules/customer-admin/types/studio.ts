export type StudioSettings = {mode:'model'|'scene'|'upscale';gender:string;appearance:string;size:string;age:string;pose:string;scene:string;ratio:string;prompt:string};
export type StudioEntry = {id:string;productId:string;productName:string;source:string;variants:string[];createdAt:string;settings:StudioSettings};
export type StudioState = {credits:number;entries:StudioEntry[]};
