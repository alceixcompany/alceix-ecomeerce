import type {ManagementAccount,SnapshotReader} from '@/types/management-snapshot';
import {initialReviews} from './mocks/reviews';
import {isReviews} from './utils/review';
import type {Review} from './types/review';
export type ManagedReview=Review&{key:string;accountId:string;scope:string};
export function managementReviews(accounts:ManagementAccount[],read:SnapshotReader):ManagedReview[]{return accounts.flatMap(a=>{const scope=a.kind==='creator'?`influencer:${a.slug}`:a.id;const owner={id:a.id,name:a.name,kind:a.kind,city:a.city};return read(`alceix:reviews:${scope}:v1`,initialReviews(owner),isReviews).filter(r=>r.target.id===a.id).map(r=>({...r,key:`${scope}~${r.id}`,accountId:a.id,scope}));});}
