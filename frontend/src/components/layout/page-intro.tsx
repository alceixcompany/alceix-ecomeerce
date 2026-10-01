import Link from "next/link";
import type { ReactNode } from "react";
import { routes } from "@/config/routes";

export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: string; children?: ReactNode }) {
  return <section className="public-intro">
    <div className="public-container">
      <nav className="public-breadcrumb" aria-label="Sayfa yolu"><Link href={routes.home}>Ana Sayfa</Link><span aria-hidden="true">/</span><span>{eyebrow}</span></nav>
      <div className="public-intro-content"><span className="public-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children}</div>
    </div>
  </section>;
}
