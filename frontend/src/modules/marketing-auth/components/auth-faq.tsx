import Link from "next/link";
import { routes } from "@/config/routes";

const questions = [
  { question: "Alceix hesabıyla neler yapabilirim?", answer: "Alceix; mağaza, tedarik ve içerik üreticisi iş birliklerini bir araya getirir. İhtiyacınıza uygun modeli Dropshipping & Tedarik, Influencer Ol ve Tedarikçimiz Ol sayfalarından inceleyebilirsiniz." },
  { question: "Başlamak için hangi bilgiler gerekiyor?", answer: "Kayıt formunda adınız, mağaza adınız, e-posta adresiniz ve şifreniz istenir. Şifreniz en az 8 karakter olmalı ve şifre tekrarıyla eşleşmelidir." },
  { question: "0 TL ile başlangıç neleri kapsıyor?", answer: "Başlangıç teklifinin kapsamı ve kullanacağınız hizmetlere ait koşullar için destek ekibinden bilgi alabilirsiniz. Ürün, kargo ve diğer hizmetlerin maliyetleri seçtiğiniz modele göre değişebilir." },
  { question: "Şifremi unuttum, nasıl destek alabilirim?", answer: "Hesabınıza erişim konusunda destek@alceix.com adresine yazabilirsiniz. Şifrenizi e-posta veya mesaj yoluyla paylaşmayın." },
];
export function AuthFaq() {
  return <section className="public-section auth-faq"><div className="public-container"><div className="auth-faq-heading"><span className="public-eyebrow">Başlamadan Önce</span><h2>Aklınızda bir soru mu var?</h2><p>Hesabınız ve ilk adımlarınız hakkında sık sorulanlar.</p></div><div className="faq-results">{questions.map(item => <details className="faq-item" key={item.question}><summary>{item.question}<span className="material-symbols-outlined" aria-hidden="true">expand_more</span></summary><p className="faq-answer">{item.answer}</p></details>)}</div><div className="auth-faq-footer"><Link href={routes.faq}>Tüm sık sorulan soruları inceleyin <span aria-hidden="true">→</span></Link></div></div></section>;
}
