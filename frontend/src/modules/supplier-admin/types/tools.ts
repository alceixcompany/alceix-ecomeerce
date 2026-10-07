export type SupplierRole = 'owner' | 'operations' | 'finance' | 'support' | 'viewer';
export type SupplierMember = {id:string;email:string;name:string;role:SupplierRole;status:'active'|'invited'|'paused'};
export type SupplierTicket = {id:string;subject:string;category:string;priority:'normal'|'high';status:'open'|'closed';messages:{id:string;text:string;author:'supplier'|'support'}[]};
export type SupplierGalleryEntry = {id:string;productId:string;name:string;image:string;scene:string;mode:string};
export type SupplierTools = {members:SupplierMember[];tickets:SupplierTicket[];gallery:SupplierGalleryEntry[];credits:number;automaticPayout:boolean;carrier:string};
