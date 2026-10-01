# Frontend bağlantıları ve kalan ihtiyaçlar

Tarih: 2026-10-01. Mevcut sayfaların kalıcı backend bağlantılarının ilk bölümü tamamlandı. Mevcut yerleşim ve görsel varlıklar korundu. İlk backend entegrasyonunda CSS değiştirilmedi; sonraki performans isteği kapsamında yükleme skeleton/shimmer efektleri ile sayfalama/filtre kontrollerinin CSS'i eklendi. Form gönderimleri, veri kaynağı, oturum, hata/başarı durumu ve gerçeği yansıtmayan demo metinleri güncellendi.

## Uygulanan bağlantılar

Tüm API yollarının başında `/api/v1` bulunur.

| Frontend alanı | Backend bağlantısı | Sonuç |
| --- | --- | --- |
| `/kayit-ol`, `/giris-yap`, admin çıkışı | `auth/register`, `login`, `me`, `logout` | Hash'li şifre, kalıcı oturum, kullanıcıya ait mağaza ve güvenli admin yönlendirmesi |
| Admin sayfaları | `stores/:slug`, SessionGuard ve sahiplik kontrolü | Sunucu üzerinden oturum/mağaza izolasyonu |
| Profil, iletişim, SEO, satış modu | `PUT stores/:slug/settings` | Aynı mağaza kaydı public vitrine yansır; version çakışmaları 409 |
| Ayar taslağı | `GET/PUT stores/:slug/settings/draft` | Taslak kalıcıdır; canlı vitrin değişmez |
| Ürün listesi, arama, kategori, sıralama, sayfalama, CSV | `stores/:slug/products`, `categories` | MongoDB sorguları; CSV tüm filtrelenmiş sayfaları alır |
| Ürün oluştur/düzenle, yayın/taslak, kopya | `POST/PUT products`, `products/:id/duplicate` | SKU benzersizliği; taslak public listede yok; kopya taslak |
| Stok ekle/düzenle | `products/:id/stock` ve ürün güncelleme | Atomik sınır kontrolü, açılış ve sonraki stok hareketleri |
| Ürün/banner/logo/favicon dosyaları | `POST stores/:slug/media?kind=…`, `GET media/:id` | Kalıcı WebP; içerik, boyut, mağaza ve kullanım alanı kontrolü |
| `/{storeSlug}` vitrin ve ürün dialogu | `public/stores/:slug`, `products`, `products/:id` | Admin'le tek veri kaynağı; filtre/sıralama/sayfalama; özel alanlar dışarı çıkmaz |
| Sepet | `GET/PUT public/stores/:slug/cart` | MongoDB kalıcılığı, sunucuda güncel fiyat/toplam/stok ve sürüm kontrolü |
| Mağaza takip butonları | `GET/PUT/DELETE public/stores/:slug/follow` | Giriş gerektirir; takip yenilemeden sonra korunur |
| Dashboard | `stores/:slug/dashboard` | Gerçek katalog/kurulum özeti; olmayan satış/bakiye/müşteri verisi null/— |
| Ana sayfa kısa ve özel sayfa uzun tedarikçi/influencer formları | `POST applications/supplier`, `applications/influencer` | DB'de pending başvuru ve başvuru kimliği; otomatik hesap/ortaklık yok |
| Dropshipping örnek katalog butonu | `POST stores/:slug/sample-products` | Oturumdaki mağazaya stok=0/taslak şablon; gerçek tedarikçi stoğu iddia edilmez |
| Şifremi unuttum | `auth/forgot-password`, `reset-password` | Backend süreli/tek kullanımlık token hazır; SMTP ve yenileme sayfası eksik |

Blog, SSS, tanıtım ve e-posta iletişim linkleri mevcut statik içerik düzenini korur. İçerik yönetimi istenmedikçe bunlar için CRUD backend gerekli değildir.

## Mantıksal boşluklar ve kararlar

1. **Satışın tamamlanması:** Ürün/sepet var; sipariş, ödeme, stok rezervasyonu, kargo, iade ve finans henüz yok. Ödeme sağlayıcısı, vergiler, kargo bedeli, komisyon ve iptal/iade kuralları belirlenmeli. Mağazanın açık olması şu anda sepete eklemeye izin verir; ödeme alma anlamına gelmez. Üretim satışına geçmeden bu zincir tamamlanmalı.
2. **Alıcı ve satıcı hesabı:** Mevcut kayıt formu mağaza oluşturur. Sadece alışveriş yapmak isteyen müşteriye mağaza açtırmak doğru akış değildir. Ayrı alıcı kayıt/giriş ve misafir sipariş politikası gerekir. Takip şimdilik mevcut hesaplarla kullanılabilir.
3. **Varyantlar:** Mevcut form seçenek adları tutar; varyant kimliği, ayrı SKU/fiyat/stok ve vitrin seçim alanı yok. Varyant stoğu destekleniyormuş gibi satış yapılmamalı.
4. **Tedarikçi ve influencer:** Başvuru onay ekranı, yetki modeli ve gerçek sağlayıcı sözleşmesi yok. Dropshipping katalog fiyatları şablondur. Influencer linki/kuponu, ilişkilendirme, komisyon hesabı ve ödeme kayıtları ayrı modüller olmalı.
5. **Mağaza adresi:** Slug değişiminde yeni adrese geçilir; eski bağlantı 404 olur. Eski slug yönlendirme/alias ve yeniden kullanım politikası belirlenmeli. Pazarlama sayfalarındaki `/luma-studio` örnek linkleri gerçek DB'de bu slug oluşturulmadıkça 404 döner; canlı veri demo kaydına düşmez.
6. **Fatura ve güven iddiaları:** Profilde şirket unvanı var; vergi numarası/dairesi, yasal adres ve fatura alanları yok. Doğrulanmış mağaza, özel domain, analitik ve AI iddialarının gerçek iş modeli/sağlayıcısı henüz yok. Mevcut doğrulama simgeleri işletme doğrulama garantisi değildir.
7. **Tatil/bakım:** Normal dışındaki modlar sepete eklemeyi durdurur. Tatilden dönüş veya teslimat erteleme tarihi için alan yok; bu nedenle tahmini teslimat sözü verilmez.
8. **Dosya yaşam döngüsü:** Yerel medya kalıcı volume ister. Public UUID dosya URL'leri erişim kontrolü sağlamaz; gizli ürün medyası gerekiyorsa ayrı politika gerekir. Yüklenip kullanılmayan/çıkarılan dosyaları temizleme ve medya kotası henüz yok.
9. **Çok kullanıcılı yayın:** Bellekte rate limit proxy IP'sini ortak kullanabilir; güvenilir IP çözümü/ortak limiter gerekir. SMTP retry/outbox, yedekleme, izleme ve çok instance dosya saklama yayın topolojisiyle tamamlanmalı.
10. **Uzun liste/dışa aktarım:** Ürün verisi server-side sayfalanır. Sayfa düğmeleri aktif sayfa çevresinde sınırlandı. Çok büyük CSV'yi job/stream ile üretmek gerekebilir; mevcut CSV ardışık sayfaları tarayıcıda birleştirir.

## Şu anda bulunmayan gerekli sayfalar

| Öncelik | Sayfa/ekran | Gereklilik |
| --- | --- | --- |
| P0 | Şifre yenileme (`/sifre-sifirla`) | E-posta token'ını alıp yeni şifreyi API'ye gönderme; mevcut giriş formu yalnız kurtarma talebini başlatır |
| P0 | Checkout: teslimat/fatura adresi, kargo, ödeme | Sepeti gerçek siparişe dönüştürme; güncel toplam ve stok/rezervasyon onayı |
| P0 | Ödeme sonucu ve sipariş onayı/takibi | Sağlayıcı sonucu ve siparişin sunucu durumunu gösterme |
| P0 | Admin sipariş listesi/detayı ve kargo yönetimi | Mevcut menü dialogudur; operasyon ekranı değildir |
| P1 | Alıcı hesap/profil, adresler ve siparişler | Satıcı kaydından ayrı müşteri deneyimi |
| P1 | Platform başvuru inceleme/onay ekranı | Tedarikçi/influencer pending kayıtlarını yetkili kullanıcıların incelemesi |
| P1 | Admin finans/cüzdan ve hareket detayı | Komisyon, tahsilat, iade ve sağlayıcı uzlaştırması |
| P1 | İade/iptal talebi ve admin destek ekranları | Sipariş sonrası süreç ve izlenebilir durum geçişleri |
| P1 | Gerçek tedarikçi bağlantı/senkronizasyon ekranı | Sağlayıcı kimliği, katalog eşleme, stok/fiyat senkronizasyonu ve hata durumu |
| P1 | Influencer paneli/kupon-link ve komisyon ekranı | Onaylanan ortaklığın kullanım ve ödeme süreçleri |
| P2 | Varyant SKU/stok düzenleme ve vitrinde varyant seçimi | Ayrı stoklu varyant modeli kullanıldığında |
| P2 | Paylaşılabilir ürün detay rotası | Şu anda dialog; bağımsız ürün URL/SEO gerekiyorsa |

Özel domain/AI stüdyo/bildirim/analitik ve CMS ekranları ürün kararı ve sağlayıcı ihtiyacı kesinleşirse eklenmeli; henüz zorunlu rota olarak uydurulmadı. Bu çalışma yeni görsel sayfa üretmedi.

## Doğrulama

- Gerçek geçici MongoDB replica set ve görsel işlemeyle 24 test: kayıt transaction rollback, oturum/Origin, mağaza izolasyonu, public alanlar, SKU/kategori benzersizliği, yayın kuralları, stale version, eş zamanlı son stok, medya içerik/sahiplik, sepet fiyat/kalıcılık, takip, başvurular, örnek import, dashboard, reset tek kullanımı/oturum iptali, uygulama yeniden başlatma ve güvenli/idempotent demo seed.
- Playwright ile 4 test (3 tarayıcı akışı ve 1 sayfalama/filtre sözleşmesi testi): kayıt → profil → gerçek dosya yükleme → ürün → vitrin → kalıcı sepet/takip; kısa/uzun başvurular ve korumalı admin yönlendirmesi. Çok ürünlü filtreli sayfalama, SSR ilk verisini tekrar çekmeme, 300 ms debounce ve reduced-motion yükleme durumları da doğrulandı. Desktop admin ve 390 px mobil vitrin/yükleme görüntüleri incelendi.
- Backend lint/typecheck/build/format ve frontend lint/TypeScript/production build kontrolleri geçti. Tarayıcı senaryoları production build üzerinde de geçti. Backend ve frontend bağımlılık taramalarında 0 açık raporlandı (2026-10-01); Next.js 15.5.27 ve düzeltilmiş PostCSS/Sharp sürümleri lock dosyalarına kaydedildi. Test harness mevcut kullanıcı DB'sini kullanmaz. Gerçek ödeme/kargo/SMTP teslimatı test edilmedi.

2026-10-01 performans ve mağaza/tedarikçi/influencer rota kararı: [002-platform-routes-and-catalogue-performance.md](decisions/002-platform-routes-and-catalogue-performance.md). Tedarikçi ve influencer profil/panel rotaları kararlaştırıldı; henüz uygulanmadı.

Kalıcı MongoDB örnek verileri ve görünür tarayıcıdaki canlı denemenin sonuçları: [live-demo.md](live-demo.md). Slug kaydı sonrası yönlendirme ve olmayan gelir için `₺0` gösterimi bu denemeden sonra düzeltildi; ilgili regresyon kontrolleri Playwright akışına eklendi.
