# Mağaza yönetimi

`/{storeSlug}/admin` ve `/admin/dashboard` aynı genel bakışı; `/admin/ayarlar` profil/taslağı; `/admin/urunler` kataloğu gösterir. Sunucu `server.ts` üzerinden gerçek oturum ve mağaza sahipliğini doğrular. Girişsiz kullanıcı giriş sayfasına gider; başka mağaza/bilinmeyen mağaza 404 olur.

`services/admin-api.ts` runtime doğrulanan API adaptörüdür. Katalog, ayarlar, taslak, kategori ve dosya kayıtları backend'de saklanır; localStorage/base64 kalıcılığı yoktur. Ürünler ve public vitrin tek kaynaktır. Listeleme server-side filtre/sıralama/altılı sayfalama; fiyat/stok/model ek filtreleri, 300 ms debounce, iptal edilen istekler ve sınırlı sayfa düğmeleri; CSV tüm filtrelenmiş sayfaları alır ve hücre formül enjeksiyonunu önler.

Ürün dialogu mevcut üç aşamayı korur. TRY fiyatlar kuruş tamsayısı, brüt marj komisyon/kargo/vergi dışındadır. Satışa yayınlama fiyat/görsel gerektirir. Version çakışmaları kaydı ezmez; +10 stok sunucuda atomiktir; kopya taslak olur. Varyantlar seçenek adlarıdır, ayrı SKU/stock yoktur. Yükleme sırasında tablo ölçülerini koruyan skeleton gösterilir; hata tekrar denemesi vardır.

Profil/taslak kaydı sunucudadır; taslak vitrini değiştirmez. Slug değişince panel yeni adrese geçer; eski adres alias değildir. Profil PNG/JPG/WebP en fazla 4 MB, ürün en fazla altı × 15 MB; gerçek yükleme kalıcı media URL döner. Dosya kaldırma ilişkiden ayırır; arka planda kullanılmayan dosya temizliği henüz yoktur.

Dashboard katalog/kurulum özetinden türetilir. Satış, müşteri, sipariş ve bakiye servisleri henüz yok; sayısal demo başarıları gösterilmez. Operasyon menüleri mevcut dialoglarla servis durumunu açıklar. Özel domain/AI/finans/kargo iş akışları uygulanmış sayılmaz. Ayrıntılar: [backend raporu](../../../../backend/docs/implementation-review.md).
