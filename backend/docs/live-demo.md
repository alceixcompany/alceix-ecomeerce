# Kalıcı MongoDB ve canlı tarayıcı denemesi

Tarih: 2026-10-01. Kullanıcının istediği görünür deneme Codex tarayıcısında, `localhost:3000` frontend ve `127.0.0.1:4000` backend ile yapıldı. Veriler sahte başarı adaptörü yerine yerel MongoDB replica set'inde `alceix_demo` veritabanına kaydedildi. Mevcut kullanıcı verisi silinmedi.

## Demo erişimi

| Alan | Adres / hesap |
| --- | --- |
| Ana vitrin | http://localhost:3000/luma-studio |
| Ana yönetim | http://localhost:3000/luma-studio/admin |
| Ürün yönetimi | http://localhost:3000/luma-studio/admin/urunler |
| Mağaza ayarları | http://localhost:3000/luma-studio/admin/ayarlar |
| Ana hesap | `demo@example.com` / `AlceixDemo2026!` |
| İkinci vitrin | http://localhost:3000/nordik-demo |
| İkinci hesap | `nordik@example.com` / `AlceixDemo2026!` |
| Tarayıcıdan açılan yeni mağaza | http://localhost:3000/canli-kayit-demo |
| Yeni mağaza hesabı | `live-registration@example.com` / `AlceixDemo2026!` |
| DB | `mongodb://127.0.0.1:27017/alceix_demo?replicaSet=rs0` |

Bu şifreler yalnız yerel demo içindir; seed üretim ve uzak veritabanlarında çalışmaz. Kalıcı dosyalar `backend/var/mongo`, `backend/var/media` içindedir. Başlatma ve tekrar seed komutları [backend README](../README.md) içindedir.

İlk seed iki mağazaya toplam 44 ürün ekledi. Canlı UI işlemleri sonunda ana mağazada 39 ürün (33 satışta, 6 taslak), ikinci mağazada 8 ürün (4 satışta, 4 taslak) var. Yeni kayıt mağazası kapalı ve boş bırakıldı. Toplam 3 kullanıcı/mağaza, 47 ürün, 4 bekleyen başvuru ve 8 medya kaydı kontrol edildi. Seed tekrar çalıştırıldığında her iki mağazaya **0 yeni ürün** ekledi ve canlı denemede değişen ayar/stoğu korudu.

## Görünür tarayıcıda doğrulanan akışlar

| Akış | Gözlenen sonuç |
| --- | --- |
| Vitrin sayfalaması | 32 yayınlanan örnek ürün iki sayfada; ikinci sayfada kalan 8 ürün |
| Kategori + fiyat + stok + sıralama + arama | Bakım, en çok 420 TL, stokta olanlar birlikte 4 ürün; `06` araması 1 ürün |
| Yükleme durumu | Veri isteğinde shimmer/skeleton; yanıt gelince ürün listesi |
| Ürün detay ve galeri | İkinci görsele geçiş, miktar ve toplam güncellemesi |
| Sepet | 2 adet serum 730 TL; 1 adede düşürünce 365 TL; sayfa yenilenince kayıt korundu |
| Hesap girişi / çıkış | Ana ve ikinci mağaza hesapları kendi paneline yönlendi; çıkıştan sonra korumalı URL girişe yönlendi |
| Yanlış şifre | Hata geri bildirimi; başarılı oturum üretilmedi |
| Yeni hesap / mağaza | Kayıt formu kullanıcıya bağlı kapalı mağaza oluşturdu; şirket unvanı ve yeni slug panelden kaydedildi |
| Dashboard | Ürün/kategori/kritik stok gerçek katalogdan; ödeme/sipariş modülü etkin değil dialogu |
| Admin filtre ve sayfalama | Tükenen tedarikçi ürünleri 2 sonuç; +10 stok sonrası ürün filtre dışına çıktı; 6 ürünlük ikinci sayfa |
| Kategori / görsel / ürün oluşturma | `Canlı Demo` kategorisi, gerçek JPG yükleme ve `LIVE-DEMO-001` ürünü MongoDB'ye kaydedildi |
| Ürün düzenleme | Fiyat 799,90 → 849,90 TL, stok 5 → 7; vitrin aynı kaydı gösterdi |
| Yayın / taslak | Taslağa alınan ürün public aramada 0 sonuç; satışa açılınca 1 sonuç |
| Kopyalama | Ayrı SKU ile taslak kopyası; public listede ikinci canlı ürün oluşmadı |
| Ayar taslağı / yayınlama | Yeni tanıtım ve banner taslakta canlı vitrini değiştirmedi; yayınlama sonrası yeni tanıtım/görsel yansıdı |
| Bakım modu | Public sepete ekleme disabled; normal moda dönünce mağaza açık |
| Takip | Giriş yapan hesapla takip kaydedildi; yenilemede `Takip ediliyor` korundu |
| Mağaza izolasyonu | Nordik hesabıyla Luma ürün paneli 404; ikinci vitrinde Luma sepeti görünmedi |
| Örnek katalog aktarımı | Hırka mağazaya `SAMPLE-CARDIGAN`, stok 0, taslak olarak eklendi |
| Uzun tedarikçi / influencer formları | Her biri başarı ve başvuru kimliği; DB'de `pending` |
| Ana sayfa kısa formları | Her iki form da başarı ve başvuru kimliği; toplam 4 pending başvuru |
| Şifre kurtarma talebi | SMTP yapılandırılmadığı için açık servis hatası; e-posta gönderilmedi |
| CSV | Görünür UI'da 2 filtrelenmiş ürün için başarı bildirimi. In-app browser indirme olayı dosya yolu döndürmedi; ayrı Playwright akışında gerçek CSV indirildi, içindeki ürün/SKU ve satır sayısı kontrol edildi |

Yüklenen hırka JPG'si **20.245 byte → 7.096 byte WebP** oldu; bu dosyada yaklaşık **%65** küçülme ölçüldü. Çıktı 512 × 279; küçük kaynak büyütülmedi. Bu oran bütün görseller için garanti değildir. Logo/favicon ve banner farklı boyut kurallarıyla işlenir; MongoDB dosyanın kendisini değil metadata ve ilişkilerini saklar.

## Bulunan sorunlar ve doğrulama

- Slug kaydı sonrası `window.location.assign` yönlendirmesi canlı tarayıcıda eski adreste kaldı. Next router yönlendirmesine geçildi; slug değişikliği, yeni panel adresi ve eski public adresin 404 olması Playwright senaryosuna eklendi. Son build'de görünür tarayıcıda da `canli-kayit-demo → canli-kayit-kontrol → canli-kayit-demo` yönlendirmeleri başarılı oldu; demo adresi korundu.
- Ödeme/sipariş verisi olmayan dashboard günlük gelir alt yazısı `₺0` gösteriyordu. Tasarım korunarak `—` yapıldı; regresyon kontrolü eklendi.
- Ayar sayfasındaki alttaki başarı bildirimi dar yükseklikte kaydetme/taslak düğmelerinin üzerine gelebiliyor. Bildirim kapatılınca işlemler çalışıyor. Görsel değişiklik yetkisi bu çalışma için genişletilmediğinden konumu değiştirilmedi; sonraki arayüz düzeltmesinde ele alınmalı.
- Pazarlama sayfalarında “canlı entegrasyon”, yüksek üretici/satıcı sayıları, otomatik komisyon ve kargo gibi mevcut tanıtım iddiaları duruyor. Bunlar çalışan backend yetenekleri veya ölçülmüş platform verisi değildir. Yayına çıkmadan metinlerin gerçek kapsamla uyumlu hale getirilmesi gerekir.

24 backend testi geçti: gerçek geçici replica set, transaction rollback, tenant izolasyonu, concurrent stok, fiyat/sepet/version, medya, uygulama yeniden başlatma, başvurular, tek kullanımlık reset, filtreler ve seed güvenliği/idempotansı. Seed testinde katalog 100 ürünü aşınca da kopya oluşturmadığı ve sahibin değiştirdiği stok/ayarı koruduğu doğrulandı.

4 Playwright testi geçti: 3 tarayıcı akışı ve 1 filtre/sayfalama sözleşmesi testi. CSV dosyası, slug yönlendirmesi, dashboard boş gelir gösterimi, desktop/mobil, SSR tekrar istek atmama, debounce, hata/yeniden deneme ve reduced-motion dahil. Backend lint/typecheck/build/format, frontend lint ve production build geçti. Test verileri ayrı geçici DB'lerde tutuldu; demo verileri korunuyor.

## Henüz tamamlanmayanlar

Tedarikçi/influencer liste, profil ve yönetim panelleri; başvuru onayı; alıcı hesabı; checkout/sipariş/ödeme/kargo/iade/finans; gerçek tedarikçi senkronizasyonu ve influencer komisyonları; SMTP teslimatı ve şifre yenileme sayfası henüz yok. Bu alanlar için çalışan uçtan uca satış akışı gösterilmedi. Gerekli ekranların öncelikli listesi ve mantıksal boşluklar [implementation-review.md](implementation-review.md) içinde.
