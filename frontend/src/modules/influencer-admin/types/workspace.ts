import type {PublishedCreator} from '@/modules/creator-directory';
export type Brand={id:string;name:string;kind:'store'|'supplier';city:string};
export type Collaboration={id:string;brandId:string;title:string;direction:'incoming'|'outgoing';status:'pending'|'active'|'submitted'|'completed'|'rejected'|'withdrawn';kind:'paid'|'gift';feeCents:number;brief:string;deliverables:string;deadline:string;createdAt:string;product:string;image:string;shipment:'none'|'preparing'|'shipped'|'delivered';tracking:string;contentUrl:string;report:string};
export type CreatorMessage={id:string;brandId:string;body:string;author:'creator'|'brand'};
export type CreatorWorkspace={profile:PublishedCreator;collaborations:Collaboration[];messages:CreatorMessage[]};
