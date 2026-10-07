export type CommissionPolicy={accountId:string;bps:number;effectiveAt:string;reason:string};
export type CommissionEntry={id:string;accountId:string;sourceId:string;kind:'order'|'work';amountCents:number;quantity:number;bps:number;commissionCents:number;booked:boolean;createdAt:string};
export type ReferralCode={id:string;ownerId:string;code:string;title:string;kind:'referral'|'campaign';rewardBps:number;discountBps:number;startsOn:string;endsOn:string;active:boolean};
export type ReferralConversion={id:string;codeId:string;customerId:string;status:'registered'|'qualified'|'rejected'|'paid';commissionBaseCents:number;rewardBps:number;rewardCents:number;createdAt:string};
export type ReviewModeration={key:string;status:'visible'|'review'|'hidden';note:string};
export type CommercialEvent={id:string;actor:string;action:string;createdAt:string};
export type Commercial={policies:CommissionPolicy[];ledger:CommissionEntry[];codes:ReferralCode[];conversions:ReferralConversion[];moderation:ReviewModeration[];events:CommercialEvent[]};
