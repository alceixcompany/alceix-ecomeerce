import {notFound} from "next/navigation";
import {CustomerReviews} from "@/modules/customer-admin/screens/reviews-screen";
import {getAdminStore} from "@/modules/customer-admin/server";
export const metadata={title:"Yorumlar & Değerlendirmeler | Alceix",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=await getAdminStore(storeSlug);if(!store)notFound();return <CustomerReviews key={store.slug} store={store}/>;}
