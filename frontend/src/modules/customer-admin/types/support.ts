export type SupportAttachment={id:string;name:string;mime:string;size:number;data:string};
export type SupportMessage={id:string;author:"merchant"|"support"|"customer";name:string;text:string;createdAt:string;attachments:SupportAttachment[]};
export type SupportTicket={id:string;channel:"platform"|"customer";category:string;subject:string;priority:"normal"|"high";status:"open"|"waiting"|"resolved";requester:string;orderId?:string;createdAt:string;messages:SupportMessage[]};
