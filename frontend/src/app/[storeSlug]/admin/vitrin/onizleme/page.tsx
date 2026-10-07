import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
import { DesignPreviewScreen } from "@/modules/customer-admin/screens/design-preview-screen";
export const metadata:Metadata={title:"Vitrin Önizlemesi | Alceix",robots:{index:false,follow:false}};
export default async function DesignPreviewPage({params,searchParams}:{params:Promise<{storeSlug:string}>;searchParams:Promise<{version?:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();const query=await searchParams;return <DesignPreviewScreen key={storeSlug} store={store} version={query.version==="published"?"published":"draft"}/>;}
