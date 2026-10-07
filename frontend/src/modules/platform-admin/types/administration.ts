export type MemberStatus='active'|'review'|'paused';
export type MemberControl={accountId:string;status:MemberStatus;verified:boolean;note:string};
export type ThreadControl={threadId:string;flagged:boolean;note:string};
export type AdminAudit={id:string;target:string;action:string;reason:string;createdAt:string};
export type Administration={members:MemberControl[];threads:ThreadControl[];audit:AdminAudit[]};
