# Müşteri mağaza yönetimi

`/{storeSlug}/admin` ve `/{storeSlug}/admin/dashboard` aynı müşteri genel bakışını gösterir. Demo slug kayıtları: `firmaadi`, `magazaadi`, `luma-studio`. Bilinmeyen mağaza 404 döner. Panelin ortak pazarlama başlığı yoktur; ayrı yerleşimi vardır.

Sihirbaz adımları, menüler ve operasyon kartları erişilebilir native dialog ile ilgili modül önizlemesini açar. Mağaza adı yalnızca bileşen state'inde güncellenir. Gerçek sipariş, ödeme, stok veya kullanıcı işlemi yapılmaz. `mocks/dashboard.ts` tipli örnek verinin sahibidir.

SVG satış çizelgesi hafta/ay seçimi, fare/dokunma ve klavye ile veri noktası seçimi içerir. Sayısal değerler örnektir. API, kalıcı kayıt ve oturum/yetki entegrasyonu henüz yoktur; `noindex` güvenlik sağlamaz. Gerçek mağaza verisi bağlanmadan önce sunucuda oturum ve tenant yetkisi doğrulanmalıdır. Dört rolün diğer panelleri kapsam dışındadır.

## Mağaza profili ve ayarlar

`/{storeSlug}/admin/ayarlar` dört bölüm içerir: kimlik, iletişim, medya ve SEO. Ortak admin menüsü ve üst bar `components/admin-shell.tsx` tarafından yönetilir. Dashboard profil kartı ve menü bu sayfaya gider. Vitrin ayarları aynı sayfanın görsel kimlik bölümüne bağlanır.

Metin ve çalışma modu ayarları canlı önizlemeye yansır. Kayıt ve taslak işlemleri `alceix:store-settings:{storeSlug}` kapsamıyla yalnızca tarayıcıda saklanır; bilinmeyen JSON doğrulanmadan kullanılmaz. Gerçek URL uygunluğu, satış modu, özel domain ve yayınlama işlemleri API olmadan uygulanmaz. Kaydedilmemiş değişiklikte tarayıcıdan ayrılma uyarısı bulunur.

PNG/JPG/WebP medya en fazla 4 MB kabul edilir; blob URL'leri önizleme sonunda temizlenir. Görseller bu oturumda kalır, sunucuya yüklenmez. Banner ve logo sağ önizlemeye yansır. Kayıt, görsel dosyalarını kalıcılaştırmaz.

## Ürün yönetimi

`/{storeSlug}/admin/urunler`: gerçek demo kayıt sayısına göre satış/taslak/kritik stok sekmeleri, kategori, Türkçe arama, fiyat/stok sıralama, altılı sayfalama ve CSV dışa aktarımı. Paylaşılabilir filtreler URL sorgusundadır. CSV hücreleri elektronik tablo formülü enjeksiyonuna karşı kaçırılır.

Ürün ekleme/düzenleme native dialog içinde üç aşamadır: kimlik/görseller, fiyat/stok/varyant seçenekleri, SEO/önizleme. Fiyatlar kuruş tamsayısıdır; brüt marj vergi, kargo ve komisyonu içermez. SKU benzersizliği, fiyat, stok ve barkod doğrulanır. Taslak eksik fiyat/görselle kaydedilebilir; satışa geçerken tamamlanır. Varyant adları seçenek olarak saklanır; varyant bazlı stok henüz yoktur.

Katalog `alceix:products:{storeSlug}` anahtarında bu tarayıcıda saklanır. PNG/JPG/WebP en fazla altı adet, her biri en fazla 15 MB kabul edilir; yerel depolama kotası aşılırsa kayıt durur ve daha küçük görsel önerilir. Dosyalar base64 olarak yerelde kalır. Kapak seçimi, görsel kaldırma, ürün kopyası oluşturma, +10 demo stok ve satış/taslak anahtarı çalışır. Gerçek API/senkronizasyon, AI görsel üretimi, canlı yayın ve sipariş işlemi yapılmaz. Örnek açıklama metni bir şablondur.
