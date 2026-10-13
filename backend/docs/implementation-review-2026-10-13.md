# Backend geliştirme ve kalan bağlantılar — 13 Ekim 2026

Bu rapor 8–9 Ekim raporlarındaki backend eksiklerini günceller. Önceki belgeler tarihsel kayıttır. MongoDB seçimi ve modüler NestJS monolit korunmuştur. Bu aşamada frontend tasarımı değiştirilmedi; yeni ticari API'lerin çoğu henüz frontend ekranlarına bağlanmadı. API testinden geçen bir akışın tarayıcı ekranı da hazır kabul edilmemelidir.

## 1. Tamamlanan işler, uygulama sırası

1. **Sahiplik ve onboarding:** hesap bağlı tedarikçi/influencer başvurusu, platform onayı/red gerekçesi, gerçek partner kaydı ve benzersiz sahiplik/slug. Anonim eski başvuruda onay sırasında açıkça geçerli hesap atanır. Onay tek başına platform yetkisi vermez. Askıya alınan hesapların oturumları iptal edilir; vitrin/partner yayını durur. Mevcut alıcı kendi siparişine ulaşabilir.
2. **Partner profili/kataloğu:** sahip kontrollü profil, sosyal bağlantılar ve portföy; ayrı tedarikçi ürünü, SKU, fiyat, minimum adet ve rezervasyonlu stok. Public dizin yalnız aktif profili ve aktif ürünü gösterir. Tedarikçi stoğu mağaza stoğundan ayrıdır.
3. **Varyant ve stok:** varyant kimliği/SKU/fiyat/available/reserved stok; tarihsel SKU kimlikleri korunur. Son stok atomik rezerve edilir. Manuel stok UUID ile tekrar korumalıdır. Ürün kopyası yeni varyant kimliği/SKU kullanır. Yeni yüklemeler metadata'sız WebP olarak normalize edilir.
4. **Hesap:** sonradan mağaza açma, beş mağaza kotası, adres defteri ve tek varsayılan adres, tek kullanımlık e-posta doğrulaması, sağlayıcı üzerinden telefon kodu/doğrulama. Telefon değişikliği doğrulamayı ve SMS iznini kaldırır. Kullanıcı profil payload'ı doğrulanmış hesap veya yönetici yetkisi oluşturamaz.
5. **Ortaklık ve mesaj:** mağaza–partner arasında karşılıklı onay, ret/kapatma/yeniden istek; taraflara özel kalıcı mesajlar. Kapalı bağlantı yeniden açıldığında karşı taraf tekrar kabul eder. Aktif iş varken bağlantı kapatılamaz. Bildirim hedefi ilgili mağaza/partner panelidir.
6. **Teklif ve kampanya:** teklif kabul/red/geri çekme, içerik teslimi, revizyon ve mağaza tamamlaması. Ücretli iş gerçek kullanılabilir bakiyeden escrow'a fonlanır; tamamlanınca partner bakiyesine ve komisyona ayrılır. Karşılıklı iptal fonu bir kez bırakır. Kampanya başvurusu/son kontenjan seçimi transaction'lıdır; influencer kendi başvurularını görür ve seçilmiş başvuruyu geri çekince yer bırakılır. Kampanya seçimi kendiliğinden ücretli sözleşme değildir.
7. **Entegrasyon altyapısı:** tipli HTTP portu, doğrulanan cevaplar, kalıcı iş kuyruğu, lease, timeout, sınırlı retry, aynı dış işlem kimliği, HMAC webhook ve değişmez olay kaydı. HTTP 200 kabulü ödeme/teslim/iade başarısı sayılmaz. Kaçan webhook için aynı imzalı sonucu sorgulama ve otomatik uzlaştırma eklendi.
8. **Checkout ve ödeme:** sunucu fiyatı/kupon/kargo/komisyon/iade politikası snapshot'ı. Gerçek cookie sepetinden version kontrollü checkout; istemci fiyat ve ürün listesiyle toplamı değiştiremez. Reddedilen ödeme stok/kupon rezervasyonunu bırakır. Süresi dolmuş veya iptal edilmiş siparişe geç gelen tahsilat mağaza geliri oluşturmaz, tam iade telafisine yönlendirilir.
9. **Kargo ve iade:** perakende ve B2B gönderi başlatma/takip; yalnız sağlayıcı kanıtı ile shipped/delivered. Teslim önce gelirse sonraki shipped olayı geriye düşürmez. Gönderilmemiş ödenmiş siparişi güvenli iptal/iade; teslim sonrası süre içindeki alıcı iadesi, mağaza onayı/red/teslim alma ve isteğe bağlı stok geri koyma. Para yalnız refund.completed kanıtıyla hareket eder. Platform finans görevlisi kapalı/askıya alınmış mağazanın iadesini de yönetebilir.
10. **Finans:** kuruş tamsayıları, dengeli ve değişmez journal, hassas kümülatif MongoDB Decimal128 bakiye, negatif bakiyenin gizlenmemesi. Teslim + snapshot iade süresi sonunda pending → available. Banka IBAN kontrolü + gerçek sahiplik sonucu; ham IBAN saklanmaz, masked IBAN ve sağlayıcı referansı saklanır. Aynı banka doğrulama isteği kalıcı receipt üzerinden döner. Para çekme önce review'da rezervasyon yapar; platform onayı payout işini oluşturur, red/iptal fonu bırakır. Paid sonucu yalnız sağlayıcıdan gelir. Geçmiş ve onay listeleri sayfalıdır.
11. **B2B:** minimum adet/yeterli tedarikçi stoğu/aktif bağlantı + gerçek mağaza bakiyesi; fiyat snapshot'ı, müşterinin onayladığı maxTotalCents üst sınırı, escrow, iptal ve gönderi. Teslimde rezervasyon tüketilir; vade sonunda tedarikçi hakedişi oluşur. Katalog ithali mağazada stock=0 taslak oluşturur; fiziksel tedarik stoğu kopyalanmaz. Başlatılmış ancak henüz fiziksel gönderilmemiş kargonun iptali sağlayıcı teyidi ister.
12. **CRM ve iletişim:** gerçek tahsilat/iade/sepetten türetilen müşteri metrikleri; doğrulanmış hesap ve açık izin olmadan sepet otomasyonu veya platform pazarlama gönderimi yapılmaz. CRM taslağı ayrı, değişmez gönderim batch'i ayrı. E-posta/SMS/WhatsApp, paged üretim, gönderim öncesi izin kontrolü, unsubscribe ve batch iptali. Consent/batch durumu ile job claim aynı transaction'da kontrol edilir. Önceden dışarı gönderilmiş belirsiz iş opt-out yüzünden sahte skipped olmaz; teyit bekler.
13. **AI stüdyo:** yapılandırılmış ücret/kredi politikası, gerçek ödenmiş kredi lot'u, rezervasyon/tüketim/iade, sahip olunan kaynak ürün/görsel, kalıcı iş, gerçek sağlayıcı görseli ve WebP çıktısı. Mağaza ve tedarikçi kataloğuna version kontrollü yayın. İptal için gönderilmemiş iş veya gerçek sağlayıcı iptal sonucu gerekir. Harcanmış/rezerve edilmiş satın alma kredisi tam iade edilemez. Root hediye kredisi ayrı audit kaydıdır.
14. **Değerlendirme/referans/fatura:** teslim edilmiş ödenmiş sipariş veya tamamlanmış ortaklık üzerinden değerlendirme, moderasyon, işletme cevabı ve gerçek ortalama. Referans kodu/kampanya kuponu, kayıt anı şart snapshot'ı ve ilk gerçek olgunlaşmış mağaza satışı üzerinden ödül; iade ödülü ters çevirir. Satıcı mali profil snapshot'ı, fatura işi ve sağlayıcı belgesi; iade sonrası credit document. Belge üretimi para iadesi yerine geçmez.
15. **Operasyon ve destek:** sayfa/yazma yetkili gerçek platform personeli, hesap kontrolü, audit listeleri, talep atama/öncelik/dahili not, iletişim formuna gerçek gönderim işi. Kullanıcı/mağaza/partner kaynaklı canlı destek, claim/assignment/mesaj/süreç CAS ve polling. Alıcı desteği sadece kendi siparişine bağlıdır. Partner destek talebi/ek/taslak/yanıt/durum ve platform partner yanıtı eklendi.
16. **Partner ekip:** operations/finance/support/viewer, sahip dahil 100 kayıt, hash'li süreli tek kullanımlık davet, yenileme/eski token iptali, rol değişimi/duraklatma/kaldırma ve anında erişim kesilmesi. Operations katalog/sipariş/stüdyo/ortaklık; support destek/mesaj; finance finans okuma. Banka değişikliği, para çekme ve ekip yönetimi owner-only'dir. Mağaza ekibinin ayrı 50 kişi sözleşmesi korunur.
17. **Satış grafiği:** mağaza/platform için UTC günlük tahsilat verisi; 1–90 gün, boş günler gerçek sıfır, pending siparişler hariç. Gross/refunded/net satış alınabilir; net satış kâr/wallet değildir. Tarihi bilinmeyen legacy paid kayıt grafik dışında kalır, createdAt ödeme tarihi diye uydurulmaz. İade değeri tahsilat günündeki siparişin güncel iade durumudur, ayrı iade günü cash-flow serisi değildir.
18. **Dayanıklılık ve bakım:** process belleği yerine ortak MongoDB oran kovası, OTP hesap sınırları, body boyut sınırı ve request ID. Workers kapanışta drain edilir, DB daha sonra kapanır. İndeks/seed/rol CLI komutları workers kapalı çalışır. Yeni ve hiç kullanılmamış upload'lar isteğe bağlı temizlenir; kullanılan/tarihsel/legacy dosyalar korunur.

## 2. İş kuralları ve sınırlar

- Para birimi bu sürümde TRY, para tamsayı kuruş, komisyon basis point'tir. Komisyon aşağı yuvarlanır. Politika eksikse ticari işlem 503/409 ile durur; demo komisyon veya iade süresi üretime taşınmaz. Test oranları yalnız fixture'dır.
- Ödeme başarısı, kargo teslimi, payout, e-posta teslimi, AI tamamlanması ve mali belge sadece doğrulanan sağlayıcı olayından gelir. Tarayıcı dönüş URL'si kanıt değildir. Provider reference/tracking biliniyorsa gelen kanıtla eşleşir.
- Stok, kupon, sipariş, ledger ve olay receipt'i gereken yerlerde aynı transaction'dadır. Ağ çağrısı DB transaction'ına konmaz. Eş zamanlı değişiklik ve tekrar farklı payload 409 olur.
- Tek bir sipariş için mevcut ödeme hazırlığı değişmezdir. Terminal red sonrası yeniden alışveriş yeni sipariş/checkout ile yapılır. Yeni UUID ile reddedilmiş siparişin kilitli fiyatı değiştirilmez.
- Perakende iade tam sipariş içindir. Kısmi ürün/tutar iadesi, değişim, çoklu para birimi, vergi kalemi bazında oran ve B2B teslim sonrası anlaşmazlık/iade bu sözleşmeye eklenmedi. Bunlar mevcut temel akışın hazır olduğu iddiasıyla karıştırılmamalıdır; istenirse ayrı ürün kapsamı, backend modeli ve test gerektirir.
- B2B teslim, ithal edilmiş perakende ürüne otomatik stok eklemez. Depoya giriş eşlemesi veya son tüketiciye otomatik dropshipping sevki ayrı iş akışıdır. Mevcut ithal ürün taslağına fiziksel stok yönetimiyle açıkça stok girilir.
- Referans ödülü merchant-first-settled-sale kuralındadır; yalnız kayıt olmak ödeme hakkı oluşturmaz. Sosyal medya takipçi/erişim verisi sağlayıcıdan alınmış doğrulanmış metrik sayılmaz.
- Canlı destek polling API'dir; WebSocket/socket cluster veya sohbetin tamamını anlık yayınlama altyapısı eklenmedi. Mesajlar ve liste boyutları sınırlıdır.
- Kullanılan dosyalar kalıcı retained durumundadır. Silinen ürünün eski görseli otomatik silinmez; sipariş/taslak/yayın/AI geçmişi kırılmaz. Tam referans sayımlı saklama/arşivleme başka bir kapsamdır. Legacy dosyalar toptan temizlenmez.
- Mevcut `marketing.sms` telefon pazarlama izni SMS/WhatsApp eligibility'sinde ortaktır. Yeni tercih ekranı bu kapsamı açıkça göstermelidir; ayrı kanal tercihleri istenirse model ayrılmalıdır. Platform broadcast endpointleri email/SMS içindir.
- Gönderim başladıktan sonra bir opt-out dış ağdaki gönderimi geri alamaz. Tekrar gönderim durdurulur ve gerçek sonucu beklenir. Sağlayıcı idempotency garantisi uygulamalıdır.

## 3. API ve frontend eşlemesi

Tüm API'ler `/api/v1` altındadır. Tam rota listesi: [api-route-inventory.md](api-route-inventory.md). Request DTO, capability ve response'un esas kaynağı ilgili controller/service'tir. Geliştirme OpenAPI `http://127.0.0.1:4000/api/docs`; yeni bütün DTO'ların OpenAPI örneklerinin eksiksiz üretildiği iddia edilmez.

| Ekran/işlev | Kullanılacak backend | Frontend durumu |
| --- | --- | --- |
| `/tedarikci`, `/influencer`, public profil | `GET public/partners`, `public/partners/:slug`, products/reviews | Public dizin/profil sayfaları eksik; pazarlama sayfası dizin değildir |
| Partner panel girişi | `account/partners`, `partners/:id/capabilities` | Slug gerçek hesaba çözülmeli; eski platform demo kapısı kaldırılmalı |
| Partner ürün/ayar/portföy | `partners/:id/profile`, `/products`, `/media` | Mevcut demo ekranlarına adaptör/hata/version bağlantısı gerekir |
| Mağaza tedarik/influencer/mesaj | store partners, links/messages/offers/campaigns | Demo veri kaynağı gerçek kayıtlarla değişmeli |
| Partner ekip/destek | partner team, partner support; platform partners/support | Tedarikçi ekip/destek ekranları mevcut; API ve rol bağlantısı gerekir |
| Mağaza/partner finans | wallet summary/journal/bank/withdrawals/onboarding | Gerçek bakiye, banka doğrulama, review ve provider sonucu gösterilmeli |
| Ürün varyant editörü | products variantOptions + manuel stok variantId/requestId | Backend hazır; eski string varyant editörü genişletilmeli |
| Checkout/alıcı sipariş | public store checkout/orders/payment/return/invoice/support | Alıcı ekranları eksik; vitrin sepeti tek başına checkout değildir |
| İade/kargo/fatura | shipments, return transition, invoice-settings/order invoice | Mevcut sipariş ayrıntısına gerçek işlem bölümleri eklenmeli |
| AI stüdyo | store/partner studio, credit purchase/refund, jobs/publish/cancel | Demo görsel/sayaç kaldırılıp kalıcı job polling kullanılmalı |
| Mağaza kampanya/CRM gönderimi | coupons, communication batches, automation rules | Taslak bağlantısı ayrı; gerçek gönderim/teslim/opt-out UX gerekir |
| Platform eposta/SMS/mesaj | opt-in recipients, broadcast/cancel/deliveries, contact review/reply | Platform iletişim ekranları demo; API bağlantısı gerekir |
| Platform personel/üyeler/finans/satış/audit | staff/accounts/control, orders/sales, withdrawals/review, finance/journal, audit | Eski demo dizileri ve yerel rol seçimleri gerçek kayıtla değişmeli |
| Değerlendirme/referans | verified-source reviews/moderation/reply, referrals/conversions | Mevcut demo ekranlarına bağlanmalı; alıcı yorum formu eksik |
| Canlı destek | account/platform live support/messages/claim/status | Platform ekranı ve müşteri destek widget'ı polling'e bağlanmalı |

Yeni sayfa veya akış listesi:

1. `/hesabim`: mağaza açma, partner başvuru durumu ve gerçek panel yönlendirmesi; mevcut mağaza profilinden ayrıdır.
2. Mağaza checkout + alıcı sipariş listesi/ayrıntısı/iptal/iade/fatura/yorum/destek; bildirimler `/hesabim/siparisler/:id` yolunu hedefler.
3. `/odeme-sonucu?payment=…`: iş durumunu API'den okur, query parametresiyle paid yapmaz.
4. `/ai-kredi-sonucu?purchase=…` ve `/banka-dogrulama-sonucu?reference=…`: sağlayıcı dönüşü + gerçek durum okuma.
5. `/eposta-dogrula?token=…`, telefon doğrulama formu, adres defteri ve açık e-posta/SMS izinleri.
6. `/iletisim-tercihleri?token=…`: public unsubscribe token'ını POST API'ye teslim eden sayfa; bilgilendirme GET'i kendi başına kayıt değiştirmez.
7. `/partner-ekip-daveti?token=…`: mağaza davetinden ayrı kabul API'si, mağazasız kayıt/girişten doğru dönüş.
8. `/tedarikci` ve `/influencer` gerçek dizinleri + public profil rotaları.
9. Platform başvuru onay/hesap atama, komisyon/iade/kargo politika ayarları, job hata/tekrar/uzlaştırma, payout review, AI politika ve mali profil yönetimi. Ayrı sayfa veya mevcut panellere bölüm olabilir.

## 4. Gerçek entegrasyonlar için kalanlar

[Gateway sözleşmesi](integration-gateway-v1.md) uygulandı; bu repo Stripe/Shopier/iyzico, kargo firması, banka, AI veya mali servis için gerçek SDK adaptörü içermez. Seçilen sağlayıcıların sözleşmelerine uygun bridge/adaptör geliştirme ve dağıtımı, hesap/onboarding ve canlı credential gerekir. Yalnız ortam değişkenlerini doldurmak bunların tamamlandığı anlamına gelmez. Entegrasyon hazırlığı domain akışı/port/DTO/outbox/webhook/uzlaştırmadır; gerçek sağlayıcı kabul testi henüz yapılmadı.

- Ödeme/geri ödeme/payout, banka sahibinin doğrulanması ve onboarding; gerçek sağlayıcıda idempotency, iptal ve olay sıralaması doğrulanmalı.
- Kargo teklif/gönderi/iptal ve teslim olayları; `shipperScopeId` gerçek pickup hesabına eşlenmeli. Influencer ürün numunesi gönderisi kampanya bütçesi veya teklif kabulüyle otomatik oluşmaz; perakende/B2B shipment slot'u kullanılmalı ya da ürün kapsamı ayrıca genişletilmeli.
- E-posta/SMS/WhatsApp gateway teslim/ret/izin mekanizması; SMTP yalnız şifre ve e-posta doğrulama için mevcut adaptörde kullanılır. Pazarlama gönderimleri gateway üzerinden yürür. SMTP paneli env/deployment durumuna bağlanmalı; plaintext secret döndüren yönetim endpointi yoktur.
- AI sağlayıcı gerçek üretim ve kontrollü binary sonuç, fiscal sağlayıcı belge/credit document ve gerçek mali uygunluk doğrulaması.
- Kalıcı volume/object storage, yedekleme, erişimi sınırlı DB, TLS ve güvenilir reverse proxy topolojisi. Local FileStorage mevcut; çok instance object storage adaptörü gerekir. Limiter artık MongoDB'de ortak fakat istemci IP aktarımı bu dağıtımda güvenli biçimde kurulmalıdır.
- Custom domain/DNS/sertifika, harici ERP/katalog senkronizasyonu, sosyal medya erişim/istatistik servisleri için sağlayıcı seçimi ve ilgili adaptör gerekir. Bu özel protokol bunlar için hazır vendor implementasyonu değildir.

## 5. Yapılandırma ve çalıştırma

- Yeni ayrılmış dönüş/doğrulama/davet slug'ları için mevcut production store slug çakışmaları dağıtım öncesi kontrol edilir; veri otomatik yeniden adlandırılmaz.
- MongoDB replica set zorunludur. `db:indexes` yeni şema/unique/TTL/queue indekslerini createIndexes ile oluşturur, veri veya mevcut indeks silmez. Çakışmalar düzeltilmeden yükseltme yapılmaz.
- Gateway URL/TOKEN/WEBHOOK_SECRET birlikte; prod HTTPS, yerelde yalnız loopback HTTP. JSON 64 KiB, binary AI sonuç 15 MiB, timeout 10 saniye ve redirects reddi. Configured yalnız ayarın varlığıdır, provider sağlık teyidi değildir.
- Store commerce-policy: platform komisyonu + açık returnDays/shippingMode/fixedShippingCents. AI fiyat politikası ve referans kodu şartları ayrı root API'lerindedir. Hiçbiri örnek yüzdelerle otomatik doldurulmaz.
- `WORKERS_ENABLED=true` normal API varsayılanı; indeks/seed/rol CLI komutları false zorlar. Dış iş kuyruğu kapatılırsa awaiting/pending kayıtları manuel sağlayıcı teyidi dışında ilerlemez.
- `UPLOAD_CLEANUP_ENABLED=false`, `UNCLAIMED_UPLOAD_HOURS=72` varsayılanları; etkinleştiğinde her worker çalışmasında en fazla 20 public + 20 private unclaimed dosya. Used/legacy dosyalar hedef değildir.
- `MAX_ACTIVE_RESERVATIONS=5`: alıcı + mağaza açık rezervasyon kotası. Sepet stok rezerve etmez. Perakende rezervasyon 30 dakika ve bounded sweeper ile bırakılır.
- Yeni özellikleri kontrol etmek için gerçek `.env`, demo verisi veya seed üzerinde finans değişikliği yapılmadı. Bu raporun ilk yazımı commit/push içermiyordu; sonraki GitHub teslimi [teslim notunda](../../docs/releases/2026-10-13.md) kayıtlıdır.

## 6. Doğrulama

Gerçek geçici MongoDB replica set, geçici medya dizini ve yerel test HTTP gateway kullanılır. Gateway fixture ödeme/banka/kargo/SMS/AI/fiscal kontratını test eder; gerçek para transferi veya servis teslimi değildir.

- Backend: **101 test**; auth/tenant/CAS/idempotency, last-stock, coupon, checkout, ödeme red/late capture/refund, ledger/maturity/payout review, B2B fiyat sınırı/stock/escrow, funded offer iptali, referans gerçek settlement/iade, mali belge, AI ve output, opt-out/phone/batch, personel/partner ekip/son kota, özel destek, provider pull, lease bütçesi/kullanıcı retry ve medya cleanup.
- Frontend yardımcıları: **88 test**.
- Chromium Playwright: **12 test**; mevcut bağlı ekranlar/proxy/SSR/sayfalama/CMS/auth/CRM/ekip/destek/media. Yeni ticari frontend sayfaları bulunmadığı için ödeme/AI/partner panelinin UI tamamlanmış olduğu bu sayıdan çıkarılamaz.
- Backend lint/typecheck/build/format; frontend lint/production build. E2E sonrası frontend normal backend `http://127.0.0.1:4000` için yeniden derlenir.
- Geçici servisler/dizinler test tarafından kapatılır/temizlenir. Yerel demo MongoDB ve `.env` dosyaları korunur.
