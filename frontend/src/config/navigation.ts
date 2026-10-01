import { routes } from "./routes";

type NavigationItem = { label: string; href: string; icon?: string; accent?: "primary" | "secondary" };

export const siteNavigation: readonly NavigationItem[] = [
  { label: "Ana Sayfa", href: routes.home },
  { label: "Hakkımızda", href: routes.about },
  { label: "Dropshipping & Tedarik", href: routes.suppliers },
  { label: "Influencer Ol", href: routes.influencer, icon: "campaign", accent: "primary" },
  { label: "Tedarikçimiz Ol", href: routes.supplierApplication, icon: "inventory_2", accent: "secondary" },
  { label: "İş Ortaklarımız", href: routes.partners },
  { label: "Blog", href: routes.blog },
  { label: "S.S.S.", href: routes.faq },
];
