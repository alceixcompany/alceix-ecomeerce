import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
import { StoreDesignScreen } from "@/modules/customer-admin/screens/store-design-screen";
export const metadata:Metadata={title:"Vitrin & Mağaza Görünümü | Alceix",robots:{index:false,follow:false}};
export default async function StoreDesignPage({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <StoreDesignScreen key={storeSlug} store={store}/>;}
