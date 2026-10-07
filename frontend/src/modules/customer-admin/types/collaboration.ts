export type Profile={name:string;email:string;phone:string;city:string;bio:string};
export type TeamMember={id:string;name:string;email:string;role:'owner'|'editor'|'support'|'viewer';status:'active'|'invited'};
export type ChatMessage={id:string;thread:string;text:string;createdAt:string};
export type OpenCampaign={id:string;title:string;brief:string;format:string;budgetCents:number;deadline:string;slots:number;status:'open'|'closed';applications:{creatorId:string;status:'new'|'accepted'|'rejected';note:string}[]};
export type SupplierReview={supplierId:string;storeName:string;rating:number;text:string;createdAt:string};
export type EmailJob={id:string;subject:string;body:string;recipients:string[];createdAt:string};
