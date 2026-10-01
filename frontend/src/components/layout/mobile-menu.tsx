"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { routes } from "@/config/routes";
import { ecommerceNavigation } from "@/config/ecommerce-navigation";
import { siteNavigation } from "@/config/navigation";
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    function onKey(event: KeyboardEvent) {if (event.key === "Escape") {setIsOpen(false);trigger.current?.focus();}}
    function onOutside(event: PointerEvent) {if (event.target instanceof Node && !container.current?.contains(event.target)) setIsOpen(false);}
    document.addEventListener("keydown",onKey);document.addEventListener("pointerdown",onOutside);
    return () => {document.removeEventListener("keydown",onKey);document.removeEventListener("pointerdown",onOutside);};
  },[isOpen]);
  return <div ref={container} className="site-mobile-menu"><button ref={trigger} type="button" className="mobile-menu-trigger" aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={()=>setIsOpen(!isOpen)}><span aria-hidden="true" className="material-symbols-outlined">{isOpen ? "close" : "menu"}</span></button>{isOpen && <nav id="mobile-navigation" aria-label="Mobil gezinme" className="mobile-navigation"><details className="mobile-ecommerce"><summary>E-Ticaret <span className="material-symbols-outlined" aria-hidden="true">expand_more</span></summary>{ecommerceNavigation.map(group => <details key={group.label}><summary>{group.label}</summary><Link href={group.href} onClick={() => setIsOpen(false)}>Tümünü keşfet →</Link>{group.links.map(item => <Link key={item.label} href={item.href} onClick={() => setIsOpen(false)}>{item.label}</Link>)}</details>)}</details>{siteNavigation.map(({label,href,icon,accent})=><Link key={label} href={href} className={accent ? `site-navigation-${accent}` : undefined} onClick={()=>setIsOpen(false)}>{icon && <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{icon}</span>}{label}</Link>)}<div className="mobile-account-links"><Link href={routes.login} onClick={() => setIsOpen(false)}>Giriş Yap</Link><Link href={routes.register} onClick={() => setIsOpen(false)}>Mağaza Aç</Link></div></nav>}</div>;
}
