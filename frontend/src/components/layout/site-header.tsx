import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";
import { siteNavigation } from "@/config/navigation";
import { EcommerceMenu } from "./ecommerce-menu";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] marketing-header">
      <div className="site-header-inner">
        <Link href={routes.home} aria-label="Alceix ana sayfa" className="site-header-logo">
          <Image alt="Alceix" className="h-8 w-auto object-contain" src="/marketing/alceix-logo.webp" width={512} height={160} priority sizes="103px" />
        </Link>
        <nav aria-label="Ana gezinme" className="site-desktop-navigation">
          <EcommerceMenu />
          {siteNavigation.filter(item => item.href !== routes.home && item.href !== routes.about).map(({ label, href, icon, accent }) => (
            <Link key={label} href={href} className={`site-navigation-link${accent ? ` site-navigation-${accent}` : ""}`}>
              {icon && <span className="material-symbols-outlined text-[21px]" aria-hidden="true">{icon}</span>}
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          <Link className="site-login-link" href={routes.login}>Giriş Yap</Link>
          <Link className="header-cta site-header-cta" href={routes.register}>Mağaza Aç</Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
