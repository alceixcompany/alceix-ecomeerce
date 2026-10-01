import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import "@/styles/public-pages.css";

export function MarketingPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`marketing-home public-page ${className}`}><SiteHeader /><main className="pt-20">{children}</main><SiteFooter /></div>;
}
