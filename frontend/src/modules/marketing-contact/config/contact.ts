export const contact = {
  email: "destek@alceix.com",
  address: "Maslak Mah. Büyükdere Cad. No: 122/A, Sarıyer / İstanbul",
  hours: "Pazartesi – Cuma · 09.00 – 18.00",
  map: "https://www.google.com/maps/search/?api=1&query=Maslak+Mahallesi+B%C3%BCy%C3%BCkdere+Caddesi+122+Sar%C4%B1yer+%C4%B0stanbul",
} as const;
export const contactTopics = [
  { value: "store", label: "Online mağaza & başlangıç", icon: "storefront" },
  { value: "supplier", label: "Dropshipping & B2B tedarik", icon: "local_shipping" },
  { value: "influencer", label: "Influencer & iş birlikleri", icon: "campaign" },
  { value: "technical", label: "Teknik destek & API", icon: "support_agent" },
  { value: "corporate", label: "Kurumsal & yatırım ilişkileri", icon: "business_center" },
] as const;
export const contactQuestions = [
  { question: "0 TL ile mağaza açtıktan sonra kurulum desteği alabilir miyim?", answer: "Başlangıç adımlarınızla ilgili sorularınızı Online mağaza & başlangıç konusunu seçerek paylaşabilirsiniz. Ekibimiz ihtiyacınızı değerlendirmek için sizinle iletişime geçebilir." },
  { question: "Tedarikçi olarak ürünlerimi sisteme nasıl ekleyebilirim?", answer: "Tedarikçimiz Ol sayfasından başvuru adımlarını inceleyebilirsiniz. Ürün kataloğunuz ve entegrasyon ihtiyaçlarınız için Dropshipping & B2B tedarik konusunu seçin." },
  { question: "Influencer başvurusu ve marka iş birlikleri için nereye yazabilirim?", answer: "Influencer Ol sayfasını inceleyin veya iletişim formunda Influencer & iş birlikleri konusunu seçerek sosyal medya hesabınızı ve iş birliği beklentinizi paylaşın." },
  { question: "Çalışma saatleri dışında talep oluşturabilir miyim?", answer: "Form taslağınızı istediğiniz zaman hazırlayabilir ve e-posta uygulamanızdan gönderebilirsiniz. Yanıt süresi konunun kapsamına ve ekibin çalışma saatlerine göre değişir." },
] as const;
