# Yorumlar & Değerlendirmeler

Ortak ekran müşteri (`/<mağaza>/admin/degerlendirmeler`) ve tedarikçi (`/tedarikci/<firma>/admin/degerlendirmeler`) panellerinde kullanılır. `ReviewEntity` mağaza, tedarikçi veya influencer olabilir. Yeni bir panel aynı açık bileşeni kullanabilir.

Gelen, verilen ve tüm profil yorumları; arama, profil türü, yıldız ve sıralama filtreleri URL'de tutulur. Puan 1–5 arasında tam sayıdır. Bir yazarın aynı profile değerlendirmesi güncellenir; kendi profilini değerlendiremez. Yanıtı yalnızca yorumun hedef profilinin sahibi yazabilir. İnceleme talebi yorumu gizlemez veya puanı değiştirmez.

Kayıtlar çalışma alanına göre `alceix:reviews:<scope>:v1` anahtarında saklanır ve yüklenirken doğrulanır. Örnek yorumlar gerçek müşteri geri bildirimi değildir. Müşteri panelinde örnek tedarikçi/influencer ilişkileri, tedarikçide aktif bağlı mağaza listesi kullanılır. Ayrı tarayıcılar/paneller arasında gerçek gönderim ve ortak puan güncellemesi yapılmaz. Sunucuda ilişki, kaynak sahipliği, spam/moderasyon ve yetki doğrulaması gerekir.

Test: `node --test src/modules/reviews/utils/*.test.mjs`.
