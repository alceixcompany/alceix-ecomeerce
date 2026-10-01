import { MarketingPage } from "@/components/layout/marketing-page";
import { AuthFaq } from "../components/auth-faq";
import { AuthForm } from "../components/auth-form";

const benefits = [
  { icon: "storefront", title: "Sizin markanız, sizin vitrininiz", description: "Kendi ürünlerinizi ve seçkilerinizi bir araya getirin." },
  { icon: "inventory_2", title: "Tedarik ağıyla yeni fırsatlar", description: "Dropshipping modelini ve ürün kategorilerini keşfedin." },
  { icon: "campaign", title: "Birlikte büyüyen bir ekosistem", description: "İçerik üreticileri ve iş ortaklarıyla buluşun." },
];

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  return <MarketingPage className="auth-page"><section className="auth-section"><div className="public-container"><div className="auth-grid"><div className="auth-story"><span className="public-eyebrow">Alceix ile Yeni Bir Başlangıç</span><h1>{mode === "register" ? <>Fikriniz bir mağazaya.<br /><span>İlk adımınız Alceix’e.</span></> : <>Mağazanız, seçkiniz,<br /><span>tek bir yerde.</span></>}</h1><p>E-ticaret yolculuğunuz için sade bir başlangıç. Ürünlerinizi sergileyin, yeni iş birliklerini keşfedin ve markanıza alan açın.</p><ul className="auth-benefits">{benefits.map((item) => <li key={item.icon}><span className="public-icon"><span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span></span><div>{item.title}<small>{item.description}</small></div></li>)}</ul><div className="auth-mini-store" aria-hidden="true"><div className="auth-mini-store-head">SİZİN YENİ MAĞAZANIZ<span>Yeni başlangıç</span></div><div className="auth-mini-store-body"><span className="public-icon"><span className="material-symbols-outlined text-[32px]">shopping_bag</span></span><div><strong>Büyük fikirler, küçük bir adımla.</strong><p>Markanızın bir sonraki sayfası burada.</p></div></div></div></div><AuthForm key={mode} mode={mode} /></div></div></section><AuthFaq /></MarketingPage>;
}
