import { routes } from "./routes";

export const ecommerceNavigation = [
  { label: "Neden Alceix?", href: "/neden-alceix", icon: "help", links: [
    { label: "Alceix’i Tanıyın", description: "Markamız ve e-ticaret yaklaşımımız.", href: routes.about },
    { label: "E-Ticarete Başlayın", description: "Mağazanız için ilk adımı atın.", href: "/e-ticarete-basla" },
    { label: "Platform Özellikleri", description: "Satış yolculuğunuzun araçlarını keşfedin.", href: routes.platform },
    { label: "Alceix Avantajları", description: "İş modelinize uygun fırsatları inceleyin.", href: routes.features },
  ] },
  { label: "Satış Modelleri", href: "/satis-modelleri", icon: "shopping_bag", links: [
    { label: "Dropshipping & Tedarik", description: "Ürün seçkisi ve tedarik modelleri.", href: routes.suppliers },
    { label: "Influencer Ol", description: "İçeriğinizle yeni iş birlikleri kurun.", href: routes.influencer },
    { label: "Tedarikçimiz Ol", description: "Ürünlerinizi ekosistemimizle buluşturun.", href: routes.supplierApplication },
    { label: "Mağaza Aç", description: "Kendi markanızla satışa hazırlanın.", href: routes.register },
  ] },
  { label: "Mağaza & Vitrin", href: "/magaza-ve-vitrin", icon: "storefront", links: [
    { label: "Örnek Mağazayı İnceleyin", description: "Müşterilerinizin göreceği vitrini keşfedin.", href: "/luma-studio" },
    { label: "Ürün Vitrinleri", description: "Alceix üzerinde ürün sunumunu inceleyin.", href: "/urun-vitrinleri" },
    { label: "Yeni Mağaza Oluşturun", description: "Kayıt sayfasından başlangıç yapın.", href: routes.register },
    { label: "Hesabınıza Giriş Yapın", description: "Mağaza hesabınıza ulaşın.", href: routes.login },
  ] },
  { label: "İş Birlikleri", href: "/is-birlikleri", icon: "handshake", links: [
    { label: "İş Ortaklarımız", description: "Alceix ekosistemini tanıyın.", href: routes.partners },
    { label: "İçerik Üreticileri", description: "Influencer programını keşfedin.", href: routes.influencer },
    { label: "Tedarik Ağı", description: "Tedarikçimiz olmak için bilgi alın.", href: routes.supplierApplication },
    { label: "Bize Ulaşın", description: "İş birliği için iletişime geçin.", href: routes.contact },
  ] },
  { label: "Blog & Rehberler", href: routes.blog, icon: "article", links: [
    { label: "Alceix Blog", description: "E-ticaret için fikirler ve pratik rehberler.", href: routes.blog },
    { label: "İlk Mağazanızı Hazırlayın", description: "Vitrin için bir başlangıç kontrol listesi.", href: "/blog/ilk-magazanizi-hazirlayin" },
    { label: "Ürün Sayfasını İyileştirin", description: "Görsel ve açıklamalar için sade öneriler.", href: "/blog/urun-sayfasi-nasil-hazirlanir" },
    { label: "Dropshipping’i Tanıyın", description: "Ürün ve tedarik sürecinin temel adımları.", href: "/blog/dropshipping-baslangic-rehberi" },
  ] },
  { label: "Yardım & Destek", href: "/yardim-destek", icon: "support_agent", links: [
    { label: "Sıkça Sorulan Sorular", description: "Başlamadan önce merak ettikleriniz.", href: routes.faq },
    { label: "İletişim", description: "Sorularınızı Alceix ekibine iletin.", href: routes.contact },
    { label: "Giriş Yap", description: "Hesap işlemleri sayfasını açın.", href: routes.login },
    { label: "Ana Sayfa", description: "Alceix’i keşfetmeye devam edin.", href: routes.home },
  ] },
] as const;
