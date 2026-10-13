# Sağlayıcı bağımsız geliştirme ve eksik akış raporu — 9 Ekim 2026

> Güncel kapsam/eksikler: [13 Ekim 2026 raporu](implementation-review-2026-10-13.md). Bu belgedeki önceki eksikler tarihsel durumu anlatır.
Bu aşama `main` üzerindeki `3a62c1a` ve önceki yerel geliştirmeler üzerine yapıldı. Yeni commit çekilmedi; commit/push yapılmadı. MongoDB ve modüler NestJS yapısı korundu; CSS veya görsel varlık değiştirilmedi. Mevcut formlar API'ye bağlandı, işlem/yükleme/hata metinleri düzeltildi. Vitrinin görünümü ancak mağaza sahibinin mevcut editörde yayınladığı tasarımla değişir.

92 frontend sayfası, controller'lar, ilgili servis/repository'ler ve ekranlardaki mock/localStorage kullanımı yeniden karşılaştırıldı. Önceki [sayfa envanteri](implementation-review-2026-10-08.md#10-tüm-frontend-sayfalarının-durum-envanteri) tarihsel kayıttır; aşağıdaki sipariş, vitrin ve kayıt değişiklikleri onun üzerine gelir. “Backend var” ifadesi yalnız aşağıda tanımlanan sözleşmenin uygulandığı anlamına gelir; ödeme/kargo tamamlandı anlamına gelmez.

## 1. Uygulama sırası

### Adım 1 — Mağazasız hesap ve davetle kayıt

- `POST /auth/register` içinde `store` isteğe bağlıdır. Boş bırakılan alan gönderilmez; hesap ve oturum transaction içinde oluşturulur, mağaza yaratılmaz. İsim/e-posta/şifre doğrulaması korunur.
- `/kayit-ol` mevcut formu mağaza açmadan kullanılabilir. Davet sayfasındaki kayıt/giriş linki güvenli `next` adresini korur; kayıt sonrası aynı davete dönülür. Token'ı kabul etmek ayrı açık kullanıcı işlemidir.
- Davet kabulü hesabı mağaza sahibi yapmaz. E-posta eşleşmesi, token hash'i, süre, tek kullanım ve davetteki rol korunur.
- **Sınır:** Bu işlem e-posta sahibini doğrulamaz. Mağazasız alıcının bağımsız hesap ana sayfası ve sonradan mağaza açma endpoint/ekranı henüz yoktur. Partner hesabı da oluşturmaz.

### Adım 2 — Sipariş ve atomik stok rezervasyonu

- `orders` modülü eklendi: domain modelleri → application port/servis → MongoDB adapter → strict HTTP DTO/controller. Katalog ve mağaza modüllerinin dışa aktarılan servisleri kullanılır.
- Merchant manuel sipariş ve oturumlu alıcı sipariş API'si aynı kaynağı kullanır. Yalnız açık/normal mağaza ve o mağazanın yayınlanmış, satışa uygun ürünü kabul edilir. Varyant adı gerçek katalogdan doğrulanır.
- Fiyat, ürün adı, SKU, varyant, görsel ve miktar sunucudan snapshot olarak kaydedilir. TRY tutarı kuruş cinsinden güvenli tamsayıdır. İstemcinin `paid`, toplam veya mağaza/aktör alanı gönderimi reddedilir.
- Sipariş ve her satırın stok hareketi **aynı MongoDB transaction'ında** kaydedilir. Son stok yarışında yalnız bir sipariş ayrılır; çok satırlı işlem başarısızsa önceki satırların stoğu da geri alınır.
- Unique `(storeId,createdBy,requestId)` ve değişmez ilk girdi ile oluşturma tekrarları korunur. Aynı kimlik/farklı girdi 409 verir; farklı kullanıcıların aynı requestId'si ayrı kapsamdadır. Oluşturma tekrarı sonradan düzenlenen güncel siparişi döndürür; yeni rezervasyon oluşturmaz.
- Başlangıç durumu `payment=pending`, `shipment=preparing`, `reservation=held`; **ödeme alınmamıştır**. `shippingQuoteAvailable=false`, `paymentAvailable=false`; kargo/indirim alanlarındaki 0 gerçek ücretsiz teslimat teklifi değildir. Toplam, bu aşamada yalnız ürün toplamıdır.
- Rezervasyon 30 dakikadır. İptal veya süre dolumu transaction içinde `cancelled/released` yapar ve stok yalnız bir kez geri bırakılır. Uygulama içi worker 60 saniyede bir en fazla 100 süresi geçmiş kayıt işler; çalışmayan uygulama stok iadesi yapmaz, yeniden çalışınca periyodik kontrol devam eder. Bu başlangıç politikası gerçek ödeme sağlayıcısının oturum süresiyle birlikte yeniden değerlendirilmelidir.
- `Product.stock` kullanılabilir stok; `reservedStock` ayrılmış stoktur. Düzenleme/manuel artırma kullanılabilir + ayrılmış stok üst sınırını korur. Eski ürünlerde eksik reservedStock 0 kabul edilir. Veri dönüşümü uygulanmadı.
- Merchant liste/detay, müşteri iletişimi, adres/dahili not düzenleme, iptal ve mevcut sayfanın CSV/paketleme özeti API'ye bağlandı. Kargo tercihidir; gerçek gönderi, mali fatura veya barkod oluşturulmaz. Manuel form ilk 100 yayınlanmış ürünü gösterir; çok satırlı sipariş API'de var, mevcut form tek satırlıdır.
- Dashboard gerçek sipariş total/pending/cancelled sayısını aynı kayıtlardan hesaplar. Ödeme ve finans sonucu üretilmez.

### Adım 3 — Vitrin CMS taslağı, yayın ve medya

- `design` modülü; unique storeId, version, draft, published, updatedAt ve publishedAt alanlarıyla eklendi. İlk kayıt ve sonraki düzenleme yarışları CAS ile korunur.
- Taslak kaydı yayını değiştirmez. Yayın onayı doğrulanmış snapshot'ı değiştirir; public response yalnız yayın ve tarihidir. API hatasında tarayıcı demo verisine geçilmez.
- Mevcut `/admin/vitrin` ve `/admin/vitrin/onizleme` sunucudan okur; localStorage kullanılmaz. Önizlemede gerçek ilk altı yayınlanmış ürün vardır; sepet yalnız tasarım önizlemesidir, sipariş oluşturmaz.
- Mevcut hero, duyuru, bölüm sırası/görünürlüğü, başlık/açıklama, arka plan, font ve CTA rengi yayınlanan public vitrinde uygulanır. Hero/products ve altı ek bölüm türü render edilir. Products yayında görünür kalmalıdır. Kontroller tanımlı tema seçeneklerini/hex rengi kabul eder, HTML render edilmez.
- Hero görseli mevcut medya API'sine banner olarak yüklenir; sıkıştırma/boyutlandırma ve metadata temizliği mevcut WebP adapter'ından geçer. Başka mağazanın, ürün alanının, dış adresin veya base64 verinin banner olarak yayınlanması reddedilir. Tek izinli statik başlangıç şablonu `/dropshipping/supplier-knit.jpg`dır; boş görsel public tarafta mevcut banner/şablon fallback'ini kullanır.
- Görünür video yalnız doğrulanmış HTTPS YouTube bağlantısıdır. Collections/Instagram bölümü gerçek yüklenen katalog sayfasını kullanır; Instagram feed entegrasyonu değildir. Testimonials sahte yorum üretmez, boş durumu gösterir. FAQ başlık/açıklama ve iletişim yönlendirmesidir; ayrı soru-cevap editörü henüz yoktur.

### Adım 4 — Bağlantı kontrolü ve bağımsız bulgular

- Gerçek UUID siparişleri eski demo ID regex'i yüzünden 404'e düşüyordu; detay rotası UUID doğrulamasına geçirildi. Tarayıcı testi oluşturma → detay → not/adres → iptal zincirini kontrol eder.
- Sayfalı siparişleri bütün veri varmış gibi istemcide yeniden filtreleme kaldırıldı. Arama/durum/taşıyıcı/tarih ve pagination backend'de uygulanır; CSV yalnız yüklenen sayfayı içerir. Sayfa değişince eski toplu seçim temizlenir.
- Sipariş penceresindeki eski ürün isteği kapanma/yeni açılış/unmount sırasında iptal edilir. Tasarım yazmaları sırasında form dondurulur; hata girdiyi korur, başarıdan önce gezinilmez.
- CMS bölüm sırası uygulanırken düzenlenebilir blok dışındaki mevcut mağaza hikâyesinin ürünlerin önüne taşınması ekran kontrolünde yakalandı; varsayılan sırası korundu ve tarayıcıda ürünlerden sonra geldiği doğrulandı.
- CMS başlangıç ayarları örnek ücretsiz kargo vaadini yayınlamaz; müşteri yorumları gerçekmiş gibi gösterilmez.
- Kayıt formundaki referans kodu doğrulanıyor ama backend'e gönderilmiyordu. Referans/komisyon sistemi olmadığı için alan açıklamayla devre dışı; kabul edilmiş kod izlenimi kaldırıldı.

## 2. Yeni HTTP sözleşmeleri

Bütün yollar `/api/v1` altındadır. Mutations aynı-origin ve oturum ister. UUID/strict body/query, tenant kapsamı ve capability sunucuda doğrulanır.

| Kapsam | Endpoint | Davranış |
| --- | --- | --- |
| Mağaza | `GET /stores/:slug/orders` | q/tab/carrier/period/page/limit; limit 1–100, varsayılan 5; kararlı tarih/ID sırası |
| Mağaza | `POST /stores/:slug/orders` | requestId + müşteri/adres + 1–30 satır, satır miktarı 1–99; stok rezervasyonu |
| Mağaza | `GET /stores/:slug/orders/:id` | Dahili not dahil özel detay |
| Mağaza | `PUT /stores/:slug/orders/:id` | version/address/city/internalNote; yalnız süresi dolmamış hazırlanan sipariş |
| Mağaza | `POST /stores/:slug/orders/:id/cancel` | version; idempotent stok bırakma |
| Alıcı | `/public/stores/:slug/orders` ve `/:id`, `/:id/cancel` | POST create, GET list/detail, POST cancel; yalnız kendi hesabının siparişi; dahili not yok |
| CMS yönetim | `GET /stores/:slug/design` | version/draft/published/tarihler |
| CMS yönetim | `PUT /stores/:slug/design/draft` | version + design, yayını değiştirmez |
| CMS yönetim | `POST /stores/:slug/design/publish` | version + design, doğrulanmış yayın snapshot'ı |
| Public CMS | `GET /public/stores/:slug/design` | design veya null + publishedAt; taslak yok |

Sipariş okuma: sahip/editör/destek/görüntüleyici. Yazma: sahip/editör. CMS okuma: mağaza read yetkisi; yayın/taslak: settings-write (sahip/editör). Ekran menülerinin tamamı henüz capability bazında gizlenmedi; backend reddi korunuyor. Destek rolünün katalog yetkisi olmadığı için tasarım önizlemesinin ürün yüklemesi bu role açık değildir.

## 3. Backend hazır, frontend eksik veya kapsamı genişletilmeli

| Hazır sözleşme | Gerekli frontend | Şimdiki sınır |
| --- | --- | --- |
| Alıcı order create/list/detail/cancel | Checkout müşteri/adres formu; siparişlerim, sipariş detayı ve ödeme bekleyen rezervasyon iptali | Sipariş API'si hazır; alıcı UI yok. Sepet otomatik siparişe dönüşmez veya temizlenmez. Ödeme/kargo seçimi API'si yok |
| Mağazasız register + account/profile | Bağımsız hesabım/profil; ilk giriş yönlendirmesi; mağaza seçimi | Davetle kayıt çalışır; davetsiz mağazasız hesap köke yönlenir. Sonradan mağaza oluşturma backend'i de gerekir |
| `GET /platform/stores` | Mevcut platform mağaza listesini gerçek data/pagination ile bağlama | Read API var; işlem düğmelerinin ayrıca backend'i gerekir |
| `GET /platform/applications` | Başvuru inceleme kuyruğu + detay ekranı | Read API var; kabul/red ve partner etkinleştirme backend'i yok |
| `GET /platform/contacts` | Genel iletişim başvurusu kuyruğu + detay | Mevcut platform destek ekranı bu kuyruğun yerine geçmez; gerçek yanıt teslimi ayrıca gerekir |
| Sipariş satırları/CAS/filtreler | Manuel çok satır ekleme, 100 üstü katalog için ürün arama/pagination, rezervasyon geri sayımı/iptal sebebi | Mevcut form tek satır; zaman/sebep API'de var, UI ayrıntısı eksik |
| CMS yayınlanan bölümler | Featured ürün seçimi, ayrı koleksiyon modeli, gerçek yorum ve FAQ editörleri, bütün butonlara ortak tema | Şu an koleksiyon/gallery gerçek mevcut sayfadaki ürünler; aksan yalnız ilgili CTA'larda; tam tema kapsamı yok |

## 4. Eksik sayfalar ve backend geliştirmeleri

1. **Checkout ve ödeme sonucu:** Alıcı sipariş endpointleri kullanılmalı; kargo tutarı/teslimat, vergi/indirim, ödeme başlatma, callback/webhook ve doğrulanmış sonuç ekranı ayrıca geliştirilmelidir. Provider bağlı olmadan “ödendi” ekranı açılamaz.
2. **Alıcı alanı:** Siparişlerim/detay, adres defteri, güvenli kargo takibi, iade/değişim, mağazaya destek ve iletişim tercihleri. Şimdilik yalnız sipariş create/list/detail/cancel backend'i vardır. Diğer başlıklar da veri/yetki modeli ister.
3. **Partner onboarding ve başvuru durumu:** Tedarikçi/influencer hesabı, sahiplik, onay/red, public dizin/profil ve kendi yönetim paneli bağlantısı. `/tedarikci` public dizini yok; mevcut partner panelleri platform görevlisi demo önizlemesidir. Başvuru göndermek partner hesabı yaratmaz.
4. **Ortaklık ve ortak mesaj kaynağı:** İki taraflı davet/kabul/iptal, teklif/teslimat ve katılımcı yetkisi; mağaza ve partner panellerinin aynı kayıtları kullanması gerekir. Mevcut yerel demo veri aktarımı gerçek katalog ile bağlı değildir.
5. **Değerlendirmeler:** Gerçek satın alma/teslimat uygunluğu, tekil yorum hakkı, moderasyon ve ortak puan kaynağı eksik. Ödeme bekleyen sipariş doğrulanmış satın alma değildir.
6. **Platform iş akışları:** Read API'ler mevcut üç listeye bağlanmalı; başvuru kararı, mağaza/üye işlem yetkileri, audit ve platform çalışan RBAC yazılmalı. Mevcut destek atama/dahili not/öncelik düzenleme alanları tamamlanmış değildir.
7. **Finans, ödeme, kargo, iade:** Ledger/komisyon ve mutabakat, imzalı idempotent webhook, gönderi/durumlar, iade kabul/stock/payment reversal ayrı modellerde yazılmalı. Sipariş özet çıktısı mali fatura değildir.
8. **CRM otomasyon ve AI:** Gönderim outbox/worker, izin yeniden kontrolü, unsubscribe, teslim/geri dönüş; AI job/kredi/iptal ve gerçek dosya çıktısı. Şimdiki CRM yalnız taslak; AI yerel demo.

## 5. Kalan mantıksal ve teknik boşluklar

- **Stok ekranı dili:** Katalog API'si kullanılabilir stock ve ayrılan reservedStock verir. Mevcut ürün editörünün “toplam stok” etiketi ve ayrı rezervasyon/fiziksel stok gösterimi bu ayrımı tam açıklamıyor; fiziksel stok ekranı geliştirilmelidir.
- **Varyant kimliği ve stok:** Mevcut varyantlar isim dizisidir. Snapshot isim doğrular ama varyant başına SKU/fiyat/stok yok. Ortak ürün stok rezervasyonu bu eksikliği çözmez; ayrı model gerekiyor.
- **Stok artırma tekrarı:** Order create/cancel tekrar korumalıdır; genel manuel stok artırma aynı garantiyi sağlamaz. Timeout sonrası kör retry kullanılmamalı; movement requestId/CAS tasarımı sonraki iş.
- **Rezervasyon istismarı/ölçek:** Sipariş sayısı veya hesaba göre aktif rezervasyon kotası henüz yok. Alıcı endpointi gerçek satışa açılmadan abuse limiter/tek instance dışı limit ve kota eklenmeli. Worker en fazla 100/dakika işler; yüksek trafik için ölçülmüş queue/worker, izleme ve backlog politikası gerekir. Süre dolumu tam 30. dakikada anında işlem garantisi değildir.
- **Sipariş yaşam döngüsü:** Ödeme yokken yalnız pending/cancelled temelidir. Ürün stok güncellemesi ile mevcut rezervasyonlar tutarlı tutulur; mağazanın kapanması mevcut siparişi otomatik iptal etmez. Vergi, kupon, teslim ücreti, finansal kapanış, gerçek fatura, retention/anonymization ve sipariş denetim geçmişi henüz yoktur.
- **CRM bağlantısı:** Manuel sipariş alıcısı otomatik CRM kaydı/marketing izni oluşturmaz. Sipariş e-postası izin kanıtı değildir. CRM toplam harcama/puanları gerçekleşmiş ödemeden türetilmelidir; şimdi uydurulmaz.
- **Yetki arayüzü:** Backend güvenliği var; ekran menü/butonları role tam uyarlanmadı. Salt okunur kullanıcının yazma düğmesi görmesi devam eden UX işi.
- **Alıcı giriş dönüşü:** Auth next izin listesi mevcut admin/davet yollarıyla sınırlıdır. Checkout veya siparişlerim sayfası eklenirken güvenli alıcı dönüş adresi de geliştirilmelidir; şimdiki girişten public checkout'a dönüş hazır değildir.
- **Hesap doğrulaması:** Mağazasız kayıt tamam; e-posta sahipliği doğrulaması ve sonradan mağaza açma tamam değil. Davetin mail eşleşmesi doğrulanmış mail sahipliği yerine geçmez.
- **CMS eski yerel verileri:** Yeni editör sunucuyu kullanır; eski localStorage taslakları otomatik içe aktarılmaz. Özellikle base64/dış varlıklar sahiplik kontrolünden geçmeden publish edilmez. Eski Mongo ürün rezervasyon alanı için geriye uyumluluk vardır; üretim DB'sine migration uygulanmadı.
- **Dosya ve dış depolama:** Görsel metadata MongoDB'de; binary mevcut yerel medya adapter'ında WebP'dir. S3/object storage değildir. Çok instance ortak kalıcı depolama ve sahipsiz medya/özel ek cleanup/retention gerekir. Yalnız kayıt olmadan yüklenen resimler otomatik temizlenmez.
- **Davet, export ve platform:** Süresi dolan davet kota koltuğunda kalır; güvenilir reissue/temizlik eksik. Büyük CSV/streaming ve hesap mağaza listesi ölçeği ayrıca ele alınmalı. Referans kodu, kupon ve statik pazarlama sayaçları gerçek ticari sonuç değildir.

## 6. Sonraki işlerin nedenleri

**Erişim bilgisi gerektirmeyen sonraki geliştirmeler:** platform read listelerini bağlama; alıcı sipariş ekranları/checkout müşteri formu; role göre menüler; mağazasız hesabım ve sonradan mağaza açma; rezervasyon abuse/stock retry koruması; partner sahipliği/onay temel modeli ve ortaklık kayıtları. Bunlar hâlâ yapılacak iştir; sağlayıcı şifresi yok diye engellenmiş sayılmıyor.

**Ürün sözleşmesi netleşmesi gerekenler:** partner onay kriteri, pay/komisyon, teslim/iade uygunluğu, varyant kimliği, kupon/vergi/teslim ücretleri, davet/kayıt doğrulama politikası. Demo ekranlardaki oran ve status'lar onaylanmış iş kararı sayılmadı.

**Dış sağlayıcı seçimi/erişimi gerekenler:** gerçek ödeme ve webhook sırrı, taşıyıcı, SMTP/SMS/WhatsApp, AI ve production object storage. Bu aşamada başarılı sahte adaptör eklenmedi.

Önerilen devam sırası: alıcı sipariş/checkout formu ve role göre UI → platform kuyrukları/partner sahipliği → gerçek ortak ilişki/mesaj → ödeme ve webhook → varyant/teslimat/iade → ledger/komisyon → iletişim ve AI. Sipariş/ödeme politikaları netleştikçe rezervasyon süresi ve geçişler güncellenir.

## 7. Doğrulama

- **Backend: 57/57 test geçti.** Önceki 45 teste 12 commerce/CMS testi eklendi. Gerçek geçici MongoDB replica set ile son stok yarışı, çok satırlı rollback, create/cancel idempotency, fiyat snapshot'ı, tenant/aktör izolasyonu, private not, expiry, stok kapasitesi, bounded pagination, takım rolü, dashboard doğruluk kaynağı, CMS ilk insert/sonraki CAS yarışı, taslak/yayın ayrımı, video ve sıkıştırılmış medya sahipliği doğrulandı.
- **Frontend yardımcıları: 88/88 test geçti.** Tutar, query, CSV ve mevcut modül doğrulamaları korundu.
- **Playwright Chromium: 12/12 test geçti.** Geçici gerçek backend/MongoDB ile üç yeni akış: manuel sipariş → detay → not/adres kalıcılığı → iptal ve stok geri bırakma; CMS taslak reload → yayın → public vitrin → kontrollü 503 sonrası girdi korunarak yeniden kayıt; mağazasız ekip kaydı → davete dönüş → role uygun kabul. Önceki dokuz akış da geçti.
- Masaüstü 1280 ve mobil 390 genişliğinde sipariş/vitrin ekranları kontrol edildi; ekran görüntüleri `frontend/test-results` içinde Git dışındadır. Gerçek public vitrinde varsayılan ürün/hikâye sırası ve içerik kontrol edildi. Yeni akışlar pageerror listelerinin boş olmasını doğrular. Görsel tasarım/CSS/varlık dosyaları değiştirilmedi.
- İlk denemelerde değişen label/role test seçicileri ve testteki eksik YouTube ID düzeltildi; gerçek UUID detay rota hatası da giderildi. Son tam tarayıcı çalıştırması 12/12 başarılıdır; başarısız ilk denemeler tamamlanmış kabul edilmedi.
- Backend lint/typecheck/build/format:check ve frontend lint/production build geçti. E2E sonrası normal frontend build yeniden üretildi; test backend 4010 rewrite'ı teslim build'inde bırakılmadı.
- `git diff --check` temiz. Yeni rapor/modül README/karar ve ilgili README'lerin yerel dosya linkleri kontrol edildi.
- Kalıcı demo/gerçek DB kullanılmadı; test fixture'ları/sunucuları kapandı. 3000/4000/3010/4010/27017 portlarında servis bırakılmadığı kontrol edildi. Ortam dosyaları değiştirilmedi; commit/push yapılmadı.

Bu kayıt yalnız uygulanan ve test edilen kapsamı doğrular. Dış ödeme, kargo, SMTP teslimi, AI, gerçek partner onboarding veya production kapasitesi test edilmiş değildir. Yukarıdaki eksikler geliştirme planında açık kalır.
