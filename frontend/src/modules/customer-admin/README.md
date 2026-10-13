# Mağaza yönetimi

`/{storeSlug}/admin` ve `/admin/dashboard` aynı genel bakışı; `/admin/ayarlar` profil/taslağı; `/admin/urunler` kataloğu gösterir. Sunucu `server.ts` üzerinden gerçek oturum ve mağaza sahipliği/aktif ekip üyeliğini ve endpoint capability sınırlarını doğrular. Girişsiz kullanıcı giriş sayfasına gider; başka mağaza/bilinmeyen mağaza 404 olur.

`services/admin-api.ts` runtime doğrulanan API adaptörüdür. Katalog, ayarlar, taslak, kategori ve dosya kayıtları backend'de saklanır; localStorage/base64 kalıcılığı yoktur. Ürünler ve public vitrin tek kaynaktır. Listeleme server-side filtre/sıralama/altılı sayfalama; fiyat/stok/model ek filtreleri, 300 ms debounce, iptal edilen istekler ve sınırlı sayfa düğmeleri; CSV tüm filtrelenmiş sayfaları alır ve hücre formül enjeksiyonunu önler.

Ürün dialogu mevcut üç aşamayı korur. TRY fiyatlar kuruş tamsayısı, brüt marj komisyon/kargo/vergi dışındadır. Satışa yayınlama fiyat/görsel gerektirir. Version çakışmaları kaydı ezmez; +10 stok sunucuda atomiktir; kopya taslak olur. Varyantlar seçenek adlarıdır, ayrı SKU/stock yoktur. Yükleme sırasında tablo ölçülerini koruyan skeleton gösterilir; hata tekrar denemesi vardır.

Profil/taslak kaydı sunucudadır; taslak vitrini değiştirmez. Slug değişince panel yeni adrese geçer; eski adres alias değildir. Profil PNG/JPG/WebP en fazla 4 MB, ürün en fazla altı × 15 MB; gerçek yükleme kalıcı media URL döner. Dosya kaldırma ilişkiden ayırır; arka planda kullanılmayan dosya temizliği henüz yoktur.

Dashboard katalog/kurulum özetinden türetilir. CRM müşteri sayısı gerçek DB kayıtlarından gelir. Sipariş total/pending/cancelled sayıları gerçek kayıtlardan gelir. Satış ve bakiye servisleri henüz yok; sayısal demo başarıları gösterilmez. Operasyon menüleri mevcut dialoglarla servis durumunu açıklar. Özel domain/AI/finans/kargo iş akışları uygulanmış sayılmaz. Ayrıntılar: [backend raporu](../../../../backend/docs/implementation-review.md).

## Ek yönetim ekranları

Katalog ve mağaza ayarları yukarıdaki sunucu adaptörlerini korur. Profil, CRM, ekip ve destek ekranları gerçek API kullanır; aşağıda belirtilen diğer ticari ekranlarda demo veriler kalır. Tedarikçi ortak editörleri müşteri mağazasının sunucu editörünü değiştirmez.

## Cüzdan ve finans

`/{storeSlug}/admin/finans`: örnek hakediş geçmişi, tarih/tür/arama filtreleri, sayfalama, işlem detayı, tüm filtrelenen kayıtlar için CSV ve yazdırma/PDF görünümü. Banka hesabı düzenleme Türkiye IBAN biçimini ve mod-97 kontrol hanesini doğrular; banka sahipliği doğrulanmaz. IBAN ve aktarım tercihleri yalnızca bileşen state içinde bu oturumda tutulur, yerel depolamaya veya sunucuya yazılmaz.

Demo aktarım talebi kullanılabilir bakiyeyi aşamaz; bekleyen talepler bakiyeden ayrılır, iptal edildiğinde geri eklenir. Tutarlar kuruş tamsayısıdır. %3 komisyon simülatörü ve mali geçerliliği olmayan örnek belge vardır. Özet kartları bağımsız tasarım verisidir, işlem tablosu gerçek muhasebe defteri değildir. Gerçek para aktarımı, otomatik banka talimatı, ödeme sağlayıcısı veya e-fatura entegrasyonu yapılmaz.

## Sipariş ve kargo

`/{storeSlug}/admin/siparisler` gerçek API'den arama, durum/taşıyıcı/tarih filtreleri ve beşli pagination kullanır. UUID detay yolu, müşteri, snapshot ürün/fiyat, adres ve dahili not sunucudan gelir. API hatasında demo fallback yoktur. Bulunamayan/izinsiz sipariş API 404'ü hata olarak gösterir; geçersiz UUID rota 404 döner.

Manuel form gerçek ilk 100 yayınlanmış ürünü/varyantını seçer; isim/e-posta/telefon/adres ve miktar gönderir. UUID attempt aynı girdiyle timeout retry'da korunur. Backend 30 dakikalık stok rezervasyonu ve pending ödeme oluşturur; fiyat sunucunun snapshot'ıdır. Not/adres CAS ile kaydedilir; iptal stok rezervasyonunu yalnız bir kez geri bırakır. Yenileme veriyi sıfırlamaz.

Ödeme/kargo/iade sağlayıcıları hazır değil; paid/shipped/refunded işaretleme, barkod veya gerçek fatura üretimi yoktur. Taşıyıcı alanı tercihtir, kargo tutarı hesaplanmaz. Sipariş/paketleme özeti yazdırılabilir; mali belge değildir. CSV yalnız yüklenen sayfayı içerir. Viewer/support read, owner/editor write sınırları backend'dedir; menülerin rol bazında ayrılması henüz tamamlanmadı.

## Vitrin tasarımı

`/{storeSlug}/admin/vitrin` mevcut duyuru/hero/bölüm/font/renk kontrollerini korur. `design-api.ts` version'lı MongoDB draft/published kaydını kullanır; localStorage yoktur. Taslak public görünümü etkilemez; yayın onayı gerçek vitrine snapshot uygular. Yazma sırasında form dondurulur, hata girdiyi korur.

PNG/JPG/WebP en fazla 2 MB mevcut banner medya API'sine yüklenir; backend WebP sıkıştırma/boyutlandırma ve sahiplik kontrolü yapar. Dış/base64/başka mağaza veya product alanı görseli yayınlanamaz. Mevcut başlangıç şablonu ayrıca izinlidir.

`/{storeSlug}/admin/vitrin/onizleme?version=draft|published` sunucudaki görünüm ve gerçek ilk altı yayınlanmış ürünle çalışır. Önizleme sepeti gerçek sipariş oluşturmaz. Testimonials boş durumu gösterir; Instagram/collections gerçek ürün galerisi, FAQ açıklama/iletişim yönlendirmesidir. Sosyal ağdan veri çekilmez. Video güvenli YouTube ID kullanır. Yayında products görünür kalır. Ayrı FAQ/featured ürün seçimi ve tam tema kapsamı sonraki iştir.

### Müşteriler & CRM

`/[storeSlug]/admin/musteriler` gerçek mağaza erişimine ve CRM capability'lerine bağlıdır. `services/crm-api.ts` müşteri/ayar/iletişim taslağı sözleşmelerini Zod ile doğrular. Müşteri oluşturma, profil/not/izin düzenleme, arama/yeni kayıt filtresi, beşli server pagination ve CSV gerçek MongoDB kayıtlarını kullanır. Normalize e-posta mağaza içinde unique; güncellemeler version CAS. Büyük sayfa listesi en fazla beş sayfa düğmesi gösterir.

Sipariş/harcama/VIP/hareketsiz/sepet/sadakat metrikleri henüz yoktur; finans alanları `—`, desteklenmeyen filtreler açık servis hatası gösterir. Sahte metrik payload'ı reddedilir. Sadakat ve terk edilmiş sepet kuralları kalıcı ayardır; otomasyon veya puan hareketi başlatmaz.

Kampanya ve e-posta taslakları sunucuda saklanır; create retry UUID requestId ile aynı kayda döner, değişik payload aynı anahtarla reddedilir. E-posta alıcı önizlemesi bütün mağazanın izinli kayıtlarından sayılır, ilk 10 alıcıyla sınırlıdır; listedeki mevcut sayfayla sınırlanmaz. Taslak kayıtları e-posta/SMS/WhatsApp göndermez, teslim kuyruğu değildir. Yerel eski demo CRM kayıtları gerçek DB'ye otomatik aktarılmaz.

### Tedarikçi pazarı, API ayarları ve ürün detayları

- `/<storeSlug>/admin/tedarik`: 6 örnek tedarikçi, kategori/arama/sıralama filtreleri.
- `/<storeSlug>/admin/tedarik/<supplierId>`: tedarikçi mağazası, ürün/beden/alış fiyatı/stok filtreleri ve toplu aktarım sepeti.
- `/<storeSlug>/admin/tedarik/<supplierId>/urun/<productId>`: iki görsel, örnek teknik bilgiler, varyant önizlemesi, fiyat ve stok detayları. Bilinmeyen mağaza, tedarikçi ve ürünler 404 verir.

Sepet ve tercihler `alceix:suppliers:<storeSlug>` altında doğrulanarak saklanır. Mesaj taslakları `alceix:suppliers:<storeSlug>:message:<supplierId>` altında yereldir. Mesaj gönderimi, tedarikçiden satın alma, API ağ çağrısı, gerçek stok eşitleme veya gerçek mağazada yayın yapılmaz. API/XML alanı yalnızca HTTPS adresinin biçimini ve güncelleme tercihlerini kaydeder; kimlik bilgileri toplanmaz.

Aktarım onayı ürünlerin tüm varyantlarını ve görsellerini mevcut `alceix:products:<storeSlug>` demo kataloğuna ekler. Gerçek Ürün Yönetimi API kataloğunu okuduğu için bu yerel aktarım orada veya public vitrinde görünmez. Varsayılan durum taslaktır; kimlik/SKU çakışması olan ürünler çoğaltılmaz ve bozuk katalog üzerine yazılmaz. Stoksuz ürünler sepete eklenmez. Fiyat kuralı %0–300 alış fiyatına ekleme oranıdır; örnek net hesabı satış eksi alış eksi %3 platform payıdır. Vergi, kargo ve diğer giderler hesapta yoktur. Paketleme tercihi üreticiye iletilmez.

Kontrol: `node --test src/modules/customer-admin/utils/supplier.test.mjs` (kuruş hesabı, varyant aktarımı, mükerrer aktarım ve API ayar doğrulaması).

### Destek masası

`/<storeSlug>/admin/destek` gerçek MongoDB talepleri, yanıtları ve durumları kullanır. Kanal/arama/öncelik/durum/sayfa/talep URL'dedir; 20'li server pagination ve ayrı tek talep lookup'u ilk sayfa dışındaki deep link'i de açar. İstek iptali, boş liste, yükleme ve hata/retry durumları vardır. UUID messageId retry çift yanıt oluşturmaz; version çakışması ezmez. Talep başına 100 mesaj sınırı.

Kaydedilen yanıt taslağı `(storeId,ticketId,userId)` kapsamında özeldir; MongoDB'ye yazılır, yeniden yüklemede korunur. Aynı içerikli taslak yanıtla birlikte transaction içinde temizlenir; farklı eşzamanlı taslak korunur. Gönderilmemiş düzenlemelerde ayrılma koruması vardır.

En fazla üç ek, dosya başına 2 MB. Resimler normalize WebP, TXT UTF-8 kontrolü, PDF başlık/EOF kontrolü. Ekler özel storage'a yüklenir; metadata sunucudan gelir. Public ürün medya URL'si veya base64/localStorage kalıcılığı yoktur. Merchant download mağaza support-read, platform download gerçek platform rolü + talebe bağlı dosya gerektirir. Bağlanmamış dosyaların cleanup job'ı henüz yok.

Platform desteği gerçek `/admin/destek` ekranına bağlıdır; görevli yanıtı merchant ekranında görünür. Merchant'in `customer` kanalı şu an manuel taleptir; gerçek alıcı hesabı/başvuru sayfası yoktur. Bilgi bankası yerel statik içerik; asistan ve WhatsApp teslimi henüz bağlı değildir.

### Influencer ve reklam yönetimi

`/[storeSlug]/admin/influencer` müşteri panelindeki iş birliği ekranıdır. Tipli örnek profiller; platform, kategori, hedef kitle, takipçi, model ve arama filtreleri URL'de tutulur. Profil/kitle/içerik detayları, hediye veya ücretli kampanya formu, kampanya listesi ve durum takibi, iptal onayı, CSV dışa aktarımı ve yerel rehber etkileşimlidir.

Kampanyalar `alceix:influencer:${store.slug}` anahtarında doğrulanarak saklanır. Tutarlar kuruş cinsinden tamsayıdır. Profil analitiği, ciro ve ROAS örnek veridir; gerçek sosyal platform, mesajlaşma, kargo, ödeme veya sözleşme entegrasyonu yoktur. Kampanya ürünleri örnek katalogdur; mağaza stokları değiştirilmez. Form kapatma ve sayfadan ayrılmada kaydedilmemiş değişiklik uyarısı bulunur. `node --test src/modules/customer-admin/utils/influencer.test.mjs` doğrulama, filtre, durum geçişi ve CSV güvenliği testlerini çalıştırır.

### AI görsel stüdyosu

`/[storeSlug]/admin/studyo` katalog seçimi, yerel görsel yükleme (PNG/JPG/WebP, 2 MB), model/sahne/oran ayarları, dört varyasyon, önce/sonra ve büyütme önizlemesi, tek görsel indirme, galeri, 1–3 ürün için toplu hazırlama ve demo kredi yönetimi sunar. Dashboard stüdyo kartı ve sidebar bu rotaya bağlanır.

Gerçek AI API'si yoktur: sonuçlar projedeki sabit örnek görsellerdir; model/sahne ayarları gerçek görüntü dönüşümü yapmaz ve 4K üretim iddiası yoktur. Hazırlama ürün başına 8 **demo** kredi kullanır; iptal veya kayıt hatasında kredi düşmez. Kayıtlar doğrulanarak `alceix:studio:${store.slug}` içinde tutulur (en fazla 30 üretim); gerçek ödeme/ücret tahsilatı yapılmaz. Görsel aktarımı mevcut ürünün `alceix:products:${store.slug}` kaydını günceller; satış durumu ve genel mağaza vitrini değişmez. Katalog son kaydı aktarım öncesinde yeniden okunur. `node --test src/modules/customer-admin/utils/studio.test.mjs` kredi sınırlarını, yükleme güvenliğini ve kayıt doğrulamasını kontrol eder.

### Influencer portföy detayları

`/[storeSlug]/admin/influencer/[creatorId]` her örnek içerik üretici için ayrı portföydür. Liste kartının **Tüm Detaylar** bağlantısı bu sayfayı açar. Hakkında/şehir/diller/uzmanlık, platform bazında takipçi/abone, Story/Reels/Post ve video ortalamaları, portföy format filtresi (URL), iş detayları ve teslimatlar, yaş dağılımı ve teklif hazırlama bağlantısı vardır. Bilinmeyen mağaza veya üretici 404 döner. `creator-portfolios.ts` tipli örnek verilerin sahibidir; gerçek profil, marka referansı veya platform analitiği değildir. Teklif bağlantısı liste sayfasındaki mevcut formu ilgili üretici seçili olarak açar.

## Mağaza iş birliği ve ekip çalışma alanı

- `/admin/mesajlar?thread=supplier:modatekstil` veya `creator:melis`: tedarikçi / influencer görüşmeleri. Yerel demo mesaj kaydı, telefon/e-posta/harici bağlantı paylaşımı için arayüz kontrolü. Sunucuda teslim, katılımcı yetkisi, moderasyon ve bağlantı denetimi uygulanmalıdır.
- `/admin/kampanyalar`: açık kampanya oluşturma, örnek influencer başvuruları, kontenjana göre seçim / ret / geri alma, portföy ve sohbet bağlantıları. Gerçek influencer başvuru paneli veya canlı yayın yoktur. Mevcut doğrudan teklif akışı korunur.
- `/admin/profil`: gerçek kişisel profil API, hesap menüsü ve version kontrolü. Alanlar yükleme/yazma sırasında disabled; geç gelen kayıt düzenlemeyi ezmez. Giriş e-postası readonly, rol payload ile atanamaz.
- `/admin/ekip`: gerçek süreli/hash'li davet, görev değiştirme ve kaldırma. Davet edilen hesap `/ekip-daveti` üzerinden kabul eder; owner, editor, support, viewer sınırları sunucuda doğrulanır. Owner dahil 50 koltuk transaction'lıdır; davet e-posta teslimi henüz yoktur.
- Tedarikçi detayında bağlı mağaza puan / yorum ekleyebilir ve kendi yorumunu güncelleyebilir. Bağlantı ürün aktarımı veya açık demo bağlama işlemi üzerinden belirlenir. Örnek yorumlar ve yerel değerlendirme ortak demo ortalamasını oluşturur; gerçek ortak yorum havuzu yoktur.
- Tedarik ürününde / aktarım sepetinde özel satış fiyatı belirlenir. Pozitif tamsayı kuruş kaydı, komisyon/kâr özeti ve ürün kataloğuna aktarım aynı fiyatı kullanır. Önceden aktarılan ürünün fiyatı Ürün Yönetimi üzerinden düzenlenir.
- CRM toplu e-posta: MongoDB taslağı, izinli alıcı önizlemesi. Eksik sepet tutarı uydurulmaz; gerçek gönderim/abonelikten çıkma henüz yoktur.

Kalan demo iş birliği kayıtları `alceix:<özellik>:<storeSlug>` anahtarlarıyla ayrılır; sınırda çalışma zamanı doğrulaması yapılır. Bu yerel kayıtlar bağlantı veya erişim yetkisi kanıtı değildir. Gerçek sistemde fiyat, mağaza bağlantısı, yorum uygunluğu, kampanya seçimi sunucuda doğrulanmalıdır. Mağaza ekip yetkileri bu aşamada sunucuda uygulanmıştır.

Kontrol: `node --test src/modules/customer-admin/utils/collaboration.test.mjs src/modules/customer-admin/utils/supplier.test.mjs`, `npm run lint`, `npm run build`.

## Sayfa geçişleri ve performans

Dashboard navigasyonu tam belge yüklemek yerine App Router kullanır. Ortak menüdeki dinamik panel bağlantıları üretimde önceden yüklenir; admin `loading.tsx` geçiş beklerken erişilebilir yükleme durumu gösterir. Mevcut URL tabanlı yerel katalog / CRM / influencer / destek filtreleri Next.js 15.5.4 tarafından desteklenen History API ile güncellenir. Katalog, CRM ve destek filtreleri gerçek server sorgularına bağlıdır; influencer ve diğer demo kayıtları hâlâ yerel filtrelenir. URL ve yeniden yüklemeyle filtreler korunur, rota değişiklikleri App Router üzerinden devam eder.

Hesap menüsü gerçek profil API'sini ve kaydetme sonrasında profil güncelleme olayını kullanır; profil doğrulaması katalog mocklarını ortak pakete taşımaz. Font tanımları tek global CSS üzerinden gelir. Sayfa geçişindeki genel yumuşak belge kaydırması kaldırılır; açıkça istenen sayfa içi rapor kaydırması korunur.

`/admin/degerlendirmeler` ortak `reviews` modülünü kullanır: mağaza, tedarikçi ve influencer yorumlarını görüntüleme, 1–5 puanla örnek değerlendirme, kendi profile gelen yoruma yanıt ve inceleme kaydı. Filtreler URL'de, demo kayıtları mağaza kapsamlı tarayıcı deposunda tutulur. Gerçek ilişki doğrulaması, gönderim ve paneller arası ortak puan hesabı henüz bağlı değildir.

Ürün editörü ve profil formunun ortak sahibi `admin-editors` modülüdür; müşteri dış arayüzü mevcut yolları korur. Tedarikçi paneli aynı bileşenleri B2B fiyat/minimum adet ve firma profili uyarlamalarıyla kullanır.

Önceki kapsam, rol tablosu ve sayfa envanteri: [8 Ekim raporu](../../../../backend/docs/implementation-review-2026-10-08.md).

9 Ekim: gerçek sipariş liste/detay/manüel oluşturma/adres/not/iptal, dashboard sipariş sayıları ve sunucuda CMS taslak/yayın bağlandı. Ödeme bekler; sağlayıcı bağlı değildir. Önizleme gerçek katalog kullanır; sipariş oluşturmaz. Kapsam ve eksikler: [güncel rapor](../../../../backend/docs/implementation-review-2026-10-09.md).
