export type Customer = {id:string;name:string;email:string;phone:string;city:string;orders:number;spentCents:number;daysSinceOrder:number;joinedDays:number;cartCents:number;points:number;consent:boolean;note:string;orderId?:string};
export type CrmSettings={earnRate:number;pointCents:number;abandonedEnabled:boolean;delayHours:number;discount:number;template:string};
export type CustomerSegment="all"|"vip"|"new"|"cart"|"inactive";
