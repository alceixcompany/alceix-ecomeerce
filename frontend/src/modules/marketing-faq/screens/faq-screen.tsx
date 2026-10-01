import Link from "next/link";
import { MarketingPage } from "@/components/layout/marketing-page";
import { PageIntro } from "@/components/layout/page-intro";
import { routes } from "@/config/routes";
import { FaqExplorer } from "../components/faq-explorer";

export function FaqScreen() {
  return <MarketingPage>
    <PageIntro eyebrow="Destek Merkezi · S.S.S." title={<>Aklınızdaki sorular,<br /><span>net cevaplar.</span></>} description="İlk mağazanızdan tedarikçi ağına, influencer iş birliklerinden kargoya kadar merak ettiğiniz her şey burada." />
    <FaqExplorer />
    <section className="public-section public-section-soft"><div className="public-container public-help"><div><span className="public-eyebrow">Yanınızdayız</span><h2 className="mt-3">Birlikte çözelim.</h2><p>Aradığınız yanıtı bulamadıysanız ekibimize ulaşın.<br />İşinize en uygun başlangıç yolunu birlikte belirleyelim.</p></div><div className="public-help-actions"><a className="public-button" href="mailto:destek@alceix.com">Destek Ekibine Yazın<span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span></a><Link className="public-button public-button-light" href={routes.contact}>İletişim</Link></div></div></section>
  </MarketingPage>;
}
