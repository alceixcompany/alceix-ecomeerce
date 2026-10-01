import "../dropshipping.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DropshippingHero } from "../components/dropshipping-hero";
import { DropshippingLogistics } from "../components/dropshipping-logistics";
import { DropshippingModels } from "../components/dropshipping-models";
import { DropshippingCatalog } from "../components/dropshipping-catalog";
import { DropshippingProcess } from "../components/dropshipping-process";
import { DropshippingPartners } from "../components/dropshipping-partners";
import { DropshippingFaq } from "../components/dropshipping-faq";
import { DropshippingCta } from "../components/dropshipping-cta";

export function DropshippingScreen() {
return <div className="marketing-home dropshipping-page bg-surface-container-lowest text-on-surface font-body-md text-body-md antialiased min-h-screen"><SiteHeader /><main className="pt-20">
<DropshippingHero />
<DropshippingLogistics />
<DropshippingModels />
<DropshippingCatalog />
<DropshippingProcess />
<DropshippingPartners />
<DropshippingFaq />
<DropshippingCta />
</main><SiteFooter /></div>;
}
