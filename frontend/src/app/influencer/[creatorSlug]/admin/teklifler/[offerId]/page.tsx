import {OfferDetail} from '@/modules/influencer-admin';
export default async function Page({params}:{params:Promise<{offerId:string}>}){const {offerId}=await params;return <OfferDetail offerId={offerId}/>;}
