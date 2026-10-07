# Mağaza yönetimi

`/{storeSlug}/admin` ve `/admin/dashboard` aynı genel bakışı; `/admin/ayarlar` profil/taslağı; `/admin/urunler` kataloğu gösterir. Sunucu `server.ts` üzerinden gerçek oturum ve mağaza sahipliğini doğrular. Girişsiz kullanıcı giriş sayfasına gider; başka mağaza/bilinmeyen mağaza 404 olur.

`services/admin-api.ts` runtime doğrulanan API adaptörüdür. Katalog, ayarlar, taslak, kategori ve dosya kayıtları backend'de saklanır; localStorage/base64 kalıcılığı yoktur. Ürünler ve public vitrin tek kaynaktır. Listeleme server-side filtre/sıralama/altılı sayfalama; fiyat/stok/model ek filtreleri, 300 ms debounce, iptal edilen istekler ve sınırlı sayfa düğmeleri; CSV tüm filtrelenmiş sayfaları alır ve hücre formül enjeksiyonunu önler.

Ürün dialogu mevcut üç aşamayı korur. TRY fiyatlar kuruş tamsayısı, brüt marj komisyon/kargo/vergi dışındadır. Satışa yayınlama fiyat/görsel gerektirir. Version çakışmaları kaydı ezmez; +10 stok sunucuda atomiktir; kopya taslak olur. Varyantlar seçenek adlarıdır, ayrı SKU/stock yoktur. Yükleme sırasında tablo ölçülerini koruyan skeleton gösterilir; hata tekrar denemesi vardır.

Profil/taslak kaydı sunucudadır; taslak vitrini değiştirmez. Slug değişince panel yeni adrese geçer; eski adres alias değildir. Profil PNG/JPG/WebP en fazla 4 MB, ürün en fazla altı × 15 MB; gerçek yükleme kalıcı media URL döner. Dosya kaldırma ilişkiden ayırır; arka planda kullanılmayan dosya temizliği henüz yoktur.

Dashboard katalog/kurulum özetinden türetilir. Satış, müşteri, sipariş ve bakiye servisleri henüz yok; sayısal demo başarıları gösterilmez. Operasyon menüleri mevcut dialoglarla servis durumunu açıklar. Özel domain/AI/finans/kargo iş akışları uygulanmış sayılmaz. Ayrıntılar: [backend raporu](../../../../backend/docs/implementation-review.md).

## Ek yönetim ekranları

Katalog ve mağaza ayarları yukarıdaki sunucu adaptörlerini korur. Diğer yeni panel ekranları aşağıda belirtildiği gibi yerel demo verileri kullanır. Tedarikçi ortak editörleri müşteri mağazasının sunucu editörünü değiştirmez.

## Cüzdan ve finans

`/{storeSlug}/admin/finans`: örnek hakediş geçmişi, tarih/tür/arama filtreleri, sayfalama, işlem detayı, tüm filtrelenen kayıtlar için CSV ve yazdırma/PDF görünümü. Banka hesabı düzenleme Türkiye IBAN biçimini ve mod-97 kontrol hanesini doğrular; banka sahipliği doğrulanmaz. IBAN ve aktarım tercihleri yalnızca bileşen state içinde bu oturumda tutulur, yerel depolamaya veya sunucuya yazılmaz.

Demo aktarım talebi kullanılabilir bakiyeyi aşamaz; bekleyen talepler bakiyeden ayrılır, iptal edildiğinde geri eklenir. Tutarlar kuruş tamsayısıdır. %3 komisyon simülatörü ve mali geçerliliği olmayan örnek belge vardır. Özet kartları bağımsız tasarım verisidir, işlem tablosu gerçek muhasebe defteri değildir. Gerçek para aktarımı, otomatik banka talimatı, ödeme sağlayıcısı veya e-fatura entegrasyonu yapılmaz.

## Sipariş ve kargo

`/{storeSlug}/admin/siparisler` arama, durum/taşıyıcı/tarih filtreleri, sayfalama, toplu seçim ve CSV içerir. Filtreler doğrulanmış URL parametreleridir. `/{storeSlug}/admin/siparisler/{orderId}` ürün, teslimat, ödeme özeti, müşteri ve dahili not ekranıdır; bilinmeyen mağaza/sipariş 404 döner.

İki ekranın demo kayıtları, sipariş rotalarına ve mağazaya bağlı provider içinde bellekte paylaşılır. Detay ve liste arasında gezinirken değişiklik korunur; yenileme veya sipariş alanından ayrılma veriyi sıfırlar. Manuel siparişler de bu kapsamdadır. Kişisel veriler tarayıcı depolamasına yazılmaz.

Ödeme, gönderi ve iade/değişim durumları ayrı modellenir. Barkod yalnızca ödenmiş/hazırlanan kayıtta üretilir; barkodu olmayan veya ödenmemiş sipariş kargoya geçirilemez. Durum geçişi hazırlanan → kargoda → teslim edildi şeklindedir. İptal ve adres düzenleme yalnızca hazırlanan siparişte kullanılabilir. İptal gerçek ödeme iadesi yapmaz. Talep onayı otomatik para iadesi veya yeni gönderi oluşturmaz.

Etiket, fatura ve paketleme görünümü tarayıcı yazdırma/PDF akışını açar. Barkod çizgileri görsel demodur ve gönderimde geçersizdir. Fatura önizlemesi mali belge değildir; KDV varsayımı yapılmaz. Kargo sözleşmesi, yazıcı ve bildirim tercihleri yalnızca demo ayarlardır; API anahtarı toplanmaz, taşıyıcıya veya müşteriye mesaj gönderilmez. `node --test src/modules/customer-admin/utils/order.test.mjs` kritik tutar, durum geçişi ve CSV kaçırma kontrollerini çalıştırır.

## Vitrin tasarımı

`/{storeSlug}/admin/vitrin` duyuru, manşet/görsel, bölüm ekleme/sıralama/gizleme/düzenleme, zemin, renk ve tipografi içerir. Bölüm sürükleme yanında erişilebilir yukarı/aşağı butonları bulunur. Masaüstü/tablet/mobil seçimleri önizleme genişliğini değiştirir; tasarım verisi ortaktır. Tek türden bir bölüm, toplam en fazla 10 bölüm desteklenir. Bento, video ve S.S.S. dahil tüm eklenen bloklar aynı önizlemede render edilir.

`/{storeSlug}/admin/vitrin/onizleme?version=draft|published` tam ekran, etkileşimli demo vitrindir. Arama, kategoriler, ürün görselleri, ürün detayı ve demo sepeti vardır. Ödeme veya sipariş oluşturmaz. FAQ soruları örnek içeriktir; Instagram blokları yerel görsel vitrindir, canlı API akışı değildir. YouTube içeriği yalnızca kullanıcı oynat düğmesine bastığında, doğrulanmış video kimliği ile youtube-nocookie iframe içinde yüklenir.

Taslak ve yayınlanan demo, `alceix:store-design:{storeSlug}:draft|published` anahtarlarıyla ayrı kaydedilir. JSON, görsel kaynağı, renk, font ve bölüm türleri okunurken doğrulanır. Yayınlama yalnızca bu tarayıcıdaki demo önizlemesini günceller; mevcut halka açık mağazaya veya sunucuya uygulanmaz. Gerçek tenant vitrin yayını için API sözleşmesi henüz yoktur. Özel domain ve SSL bağlantısı aktifmiş gibi sunulmaz.

PNG/JPG/WebP en fazla 2 MB kabul edilir ve okunabilirliği decode ile kontrol edilir. Data URL bu tarayıcıda saklanabilir; kota hatasında kayıt durur. Sunucuya dosya yüklenmez. Sistem Sans ve Klasik Serif, cihazın Arial/Georgia karşılıklarını kullanır; yüklü olmayan Inter/Playfair fontları vaat edilmez. Vurgu renginde açık/koyu okunabilir metin rengi seçilir. Kaydedilmemiş sayfa/bölüm değişiklikleri için ayrılma ve kapatma uyarıları vardır.

`node --test src/modules/customer-admin/utils/store-design.test.mjs`: kayıt doğrulama, güvenli görsel/video kaynağı, bölüm sıralaması, yayın koşulları, kapsam anahtarları ve renk kontrastı kontrolleri.

### Müşteriler & CRM

`/[storeSlug]/admin/musteriler` yalnızca kayıtlı demo mağazaları kabul eder. Müşteri listesi, profil/not düzenleme, müşteri ekleme, sadakat ve terk edilmiş sepet ayarları, iletişim/kampanya taslakları ve filtrelenmiş CSV dışa aktarımı içerir. Segment, arama, harcama, son sipariş ve sayfa filtreleri URL'de tutulur. VIP sınırı ₺5.000 toplam harcama; yeni kayıt sınırı 30 gün; hareketsizlik siparişi olan müşterilerde 90 gündür.

Müşteriler ve ayarlar `alceix:crm:<storeSlug>`, kampanya taslağı `alceix:crm:<storeSlug>:campaign` altında tarayıcıda saklanır. Kayıtlar doğrulanır, mükerrer e-posta engellenir. SMS/e-posta/WhatsApp gönderilmez, otomasyon işletilmez, sadakat puanları finansal işlem değildir. Kampanya hedef kitlesi yalnızca iletişim izni işaretli kayıtları içerir. Özetler görünen demo verilerinden hesaplanır; çizelgeler dekoratif örneklerdir. Örnek siparişi bulunan profiller mevcut sipariş detayına bağlanır. Profil değişiklikleri sipariş verisini değiştirmez.

Kontrol: `node --test src/modules/customer-admin/utils/customer.test.mjs` (segment sınırları, birleştirilmiş filtreler, kayıt doğrulama ve CSV formül kaçışı).

### Tedarikçi pazarı, API ayarları ve ürün detayları

- `/<storeSlug>/admin/tedarik`: 6 örnek tedarikçi, kategori/arama/sıralama filtreleri.
- `/<storeSlug>/admin/tedarik/<supplierId>`: tedarikçi mağazası, ürün/beden/alış fiyatı/stok filtreleri ve toplu aktarım sepeti.
- `/<storeSlug>/admin/tedarik/<supplierId>/urun/<productId>`: iki görsel, örnek teknik bilgiler, varyant önizlemesi, fiyat ve stok detayları. Bilinmeyen mağaza, tedarikçi ve ürünler 404 verir.

Sepet ve tercihler `alceix:suppliers:<storeSlug>` altında doğrulanarak saklanır. Mesaj taslakları `alceix:suppliers:<storeSlug>:message:<supplierId>` altında yereldir. Mesaj gönderimi, tedarikçiden satın alma, API ağ çağrısı, gerçek stok eşitleme veya gerçek mağazada yayın yapılmaz. API/XML alanı yalnızca HTTPS adresinin biçimini ve güncelleme tercihlerini kaydeder; kimlik bilgileri toplanmaz.

Aktarım onayı ürünlerin tüm varyantlarını ve görsellerini mevcut `alceix:products:<storeSlug>` demo kataloğuna ekler. Ürün Yönetimi sayfasında görülebilir. Varsayılan durum taslaktır; kimlik/SKU çakışması olan ürünler çoğaltılmaz ve bozuk katalog üzerine yazılmaz. Stoksuz ürünler sepete eklenmez. Fiyat kuralı %0–300 alış fiyatına ekleme oranıdır; örnek net hesabı satış eksi alış eksi %3 platform payıdır. Vergi, kargo ve diğer giderler hesapta yoktur. Paketleme tercihi üreticiye iletilmez.

Kontrol: `node --test src/modules/customer-admin/utils/supplier.test.mjs` (kuruş hesabı, varyant aktarımı, mükerrer aktarım ve API ayar doğrulaması).

### Destek masası

`/<storeSlug>/admin/destek` platform/müşteri kanallarını, arama/öncelik/durum filtrelerini ve seçili talebi URL'de tutar. Yeni talepler, yerel yanıtlar, çözüldü/yeniden açma, talep bağlantısı kopyalama, TXT konuşma dökümü, bilgi bankası ve demo asistan içerir. WhatsApp düğmesi bağlantı durumunu açıklar; gerçek mesaj göndermeyen talep formuna yönlendirir.

`alceix:support:<storeSlug>` anahtarında doğrulanan talepler ve yanıt taslakları saklanır. Sekme/talep geçişinde taslaklar korunur; açık kayıt edilmemiş taslaklarla sayfadan ayrılırken koruma vardır. En fazla 100 talep, talep başına 100 mesaj, yanıt başına üç ek desteklenir. PNG/JPG/WebP/PDF/TXT dosyaları dosya başına 2 MB ile sınırlıdır. Ekler yerel data URL olarak saklanır ve indirilebilir; HTML/SVG ve çalıştırılabilir dosyalar kabul edilmez. Büyük eklerde tarayıcı kotası aşılırsa form korunur ve hata gösterilir. Dosya seçmek sunucuya yükleme değildir.

Destek ekibi, müşteri, WhatsApp veya yapay zekâ servisine ağ çağrısı yapılmaz. Örnek konuşmalar gerçek destek yanıtları değildir; asistan yerel rehber metinlerini sunar. İstatistikler demo kayıtlarından hesaplanır; canlı SLA veya çevrimiçi operatör iddiası yoktur. Sipariş bağlantıları mevcut demo sipariş detayını açar.

Kontrol: `node --test src/modules/customer-admin/utils/support.test.mjs` (birleşik filtreler, kapalı talep yanıt kuralları, ek sınırları ve yerel kayıt doğrulaması).

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
- `/admin/profil`: kişisel profil, üst sağ hesap menüsü, kaydedilmemiş profil uyarısı. Gerçek giriş e-postası veya oturum değiştirilmez.
- `/admin/ekip`: e-posta daveti hazırlama, görev düzenleme, demo kabulü ve kaldırma onayı. Tek aktif sahip korunur. E-posta teslimi, davet tokenı, çoklu kullanıcı oturumu ve sunucu RBAC henüz yoktur.
- Tedarikçi detayında bağlı mağaza puan / yorum ekleyebilir ve kendi yorumunu güncelleyebilir. Bağlantı ürün aktarımı veya açık demo bağlama işlemi üzerinden belirlenir. Örnek yorumlar ve yerel değerlendirme ortak demo ortalamasını oluşturur; gerçek ortak yorum havuzu yoktur.
- Tedarik ürününde / aktarım sepetinde özel satış fiyatı belirlenir. Pozitif tamsayı kuruş kaydı, komisyon/kâr özeti ve ürün kataloğuna aktarım aynı fiyatı kullanır. Önceden aktarılan ürünün fiyatı Ürün Yönetimi üzerinden düzenlenir.
- CRM toplu e-posta: izinli alıcı segmenti, terk edilmiş sepet tutarıyla kişiselleştirme, alıcı önizlemesi ve yerel demo kuyruğu. Gerçek teslim, ürün bazında sepet bağlantısı ve abonelikten çıkma endpointleri backend/e-posta servisi gerektirir.

Kayıtlar `alceix:<özellik>:<storeSlug>` anahtarlarıyla ayrılır; sınırda çalışma zamanı doğrulaması yapılır. Bu yerel kayıtlar bağlantı veya erişim yetkisi kanıtı değildir. Gerçek sistemde fiyat, mağaza bağlantısı, yorum uygunluğu, kampanya seçimi ve ekip yetkileri sunucuda doğrulanmalıdır.

Kontrol: `node --test src/modules/customer-admin/utils/collaboration.test.mjs src/modules/customer-admin/utils/supplier.test.mjs`, `npm run lint`, `npm run build`.

## Sayfa geçişleri ve performans

Dashboard navigasyonu tam belge yüklemek yerine App Router kullanır. Ortak menüdeki dinamik panel bağlantıları üretimde önceden yüklenir; admin `loading.tsx` geçiş beklerken erişilebilir yükleme durumu gösterir. Mevcut URL tabanlı yerel katalog / CRM / influencer / destek filtreleri Next.js 15.5.4 tarafından desteklenen History API ile güncellenir. Bu filtrelerin tüm verisi tarayıcıdaki demo veridir; sunucu araması eklenirse veri adaptörü / navigasyon sözleşmesi yeniden değerlendirilmelidir. URL ve yeniden yüklemeyle filtreler korunur, rota değişiklikleri App Router üzerinden devam eder.

Hesap menüsü yalnızca profil kaydı değiştiğinde depolamayı okur; profil doğrulaması katalog mocklarını ortak pakete taşımaz. Font tanımları tek global CSS üzerinden gelir. Sayfa geçişindeki genel yumuşak belge kaydırması kaldırılır; açıkça istenen sayfa içi rapor kaydırması korunur.

`/admin/degerlendirmeler` ortak `reviews` modülünü kullanır: mağaza, tedarikçi ve influencer yorumlarını görüntüleme, 1–5 puanla örnek değerlendirme, kendi profile gelen yoruma yanıt ve inceleme kaydı. Filtreler URL'de, demo kayıtları mağaza kapsamlı tarayıcı deposunda tutulur. Gerçek ilişki doğrulaması, gönderim ve paneller arası ortak puan hesabı henüz bağlı değildir.

Ürün editörü ve profil formunun ortak sahibi `admin-editors` modülüdür; müşteri dış arayüzü mevcut yolları korur. Tedarikçi paneli aynı bileşenleri B2B fiyat/minimum adet ve firma profili uyarlamalarıyla kullanır.
