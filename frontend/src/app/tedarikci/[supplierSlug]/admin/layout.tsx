import type { Metadata } from "next";
import {notFound} from "next/navigation";
import {getSupplierCompany} from "@/modules/supplier-admin/mocks/workspace";
import {WorkspaceProvider} from "@/modules/supplier-admin/components/workspace-provider";
import {SupplierShell} from "@/modules/supplier-admin/components/supplier-shell";
export const metadata:Metadata={title:"Tedarikçi Yönetimi | Alceix",robots:{index:false,follow:false}};
export default async function SupplierLayout({children,params}:{children:React.ReactNode;params:Promise<{supplierSlug:string}>}){const {supplierSlug}=await params;const company=getSupplierCompany(supplierSlug);if(!company)notFound();return <WorkspaceProvider key={company.id} company={company}><SupplierShell>{children}</SupplierShell></WorkspaceProvider>;}
