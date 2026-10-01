import "../supplier.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SupplierHero } from "../components/supplier-hero";
import { SupplierBenefits } from "../components/supplier-benefits";
import { SupplierProcess } from "../components/supplier-process";
import { SupplierPartners } from "../components/supplier-partners";
import { SupplierFaq } from "../components/supplier-faq";
import { SupplierCta } from "../components/supplier-cta";

export function SupplierScreen() {
 return <div className="marketing-home supplier-page bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen">
 <SiteHeader />
 <main className="pt-20">
 <SupplierHero />
 <SupplierBenefits />
 <SupplierProcess />
 <SupplierPartners />
 <SupplierFaq />
 <SupplierCta />
 </main>
 <SiteFooter />
 </div>;
}
