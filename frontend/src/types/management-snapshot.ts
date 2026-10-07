export type AccountKind='store'|'supplier'|'creator';
export type ManagementOrder={id:string;accountId:string;buyer:string;amountCents:number;quantity:number;createdAt?:string;status:'preparing'|'shipped'|'delivered'|'cancelled';payment:string;detailUrl:string;product:string};
export type ManagementWork={id:string;accountId:string;title:string;partner:string;amountCents:number;status:string;detailUrl:string;brief:string};
export type ManagementThread={id:string;accountId:string;partner:string;messages:{id:string;sender:string;body:string}[];panelUrl:string};
export type ManagementTicket={id:string;accountId:string;source:AccountKind|'buyer';requester:string;subject:string;category:string;priority:'normal'|'high';status:'open'|'waiting'|'resolved';orderId?:string;messages:{id:string;sender:string;body:string}[]};
export type ManagementAccount={id:string;slug:string;kind:AccountKind;name:string;city:string;initials:string;bio:string;email:string;photo?:string;panelUrl:string;publicUrl:string;products:number;customers:number;people:{name:string;role:string}[];orders:ManagementOrder[];works:ManagementWork[];tickets:ManagementTicket[];threads:ManagementThread[];metrics:{label:string;value:string}[]};
export type SnapshotReader=<T>(key:string,fallback:T,validate:(v:unknown)=>v is T)=>T;
