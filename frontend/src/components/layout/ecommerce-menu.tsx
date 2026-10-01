"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { routes } from "@/config/routes";
import { ecommerceNavigation } from "@/config/ecommerce-navigation";
import "./ecommerce-menu.css";

export function EcommerceMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const group = ecommerceNavigation[active];
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {document.removeEventListener("pointerdown", outside);document.removeEventListener("keydown", escape);};
  }, [open]);
  return <div ref={container} className="ecommerce-menu" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}><button ref={trigger} type="button" className="site-navigation-link ecommerce-menu-trigger" aria-expanded={open} aria-controls="ecommerce-panel" onClick={() => setOpen(!open)}>E-Ticaret<span className="material-symbols-outlined" aria-hidden="true">{open ? "expand_less" : "expand_more"}</span></button>{open && <div id="ecommerce-panel" className="ecommerce-panel"><div className="ecommerce-panel-inner"><div className="ecommerce-categories" role="group" aria-label="E-ticaret konuları">{ecommerceNavigation.map((item, index) => <button key={item.label} type="button" aria-pressed={active === index} aria-controls="ecommerce-links" onPointerEnter={event => { if (event.pointerType === "mouse") setActive(index); }} onFocus={() => setActive(index)} onClick={() => setActive(index)}><span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>{item.label}<span className="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>)}</div><div className="ecommerce-links" id="ecommerce-links"><Link className="ecommerce-group-label" href={group.href} onClick={() => setOpen(false)}>{group.label} · Tümünü keşfet ↗</Link><div className="ecommerce-link-grid">{group.links.map(item => <Link key={item.label} href={item.href} onClick={() => setOpen(false)}><strong>{item.label}<span aria-hidden="true">↗</span></strong><span>{item.description}</span></Link>)}</div><div className="ecommerce-panel-note"><span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>Fikrinizden ilk satışınıza, Alceix yanınızda.</div></div><Link className="ecommerce-feature" href={routes.register} onClick={() => setOpen(false)}><div className="ecommerce-feature-art"><Image src="/dropshipping/serum.jpg" alt="E-ticaret vitrini için bakım ürünü örneği" width={600} height={600} sizes="300px" /><span className="ecommerce-feature-tag">ALCEIX / SİZİN YENİ MAĞAZANIZ</span><span className="ecommerce-feature-card"><span className="material-symbols-outlined" aria-hidden="true">storefront</span><strong>Fikriniz bir mağazaya.</strong><small>İlk adımınızı bugün atın.</small></span></div><h3>E-ticaret mağazanızı Alceix ile açın.</h3><p>Ürünlerinizi kendi vitrininizde müşterilerinizle buluşturun.</p><strong className="ecommerce-feature-cta">Mağaza Aç <span aria-hidden="true">→</span></strong></Link></div></div>}</div>;
}
