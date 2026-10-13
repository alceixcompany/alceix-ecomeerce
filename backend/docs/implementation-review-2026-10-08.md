# Frontend–backend incelemesi ve ikinci uygulama aşaması

> Güncel kapsam/eksikler: [13 Ekim 2026 raporu](implementation-review-2026-10-13.md). Bu belgedeki önceki eksikler tarihsel durumu anlatır.
Sonraki geliştirme ve güncel eksikler: [9 Ekim raporu](implementation-review-2026-10-09.md). Bu belge önceki aşamanın tarihsel kaydıdır.

Sonraki hata incelemesi, düzeltmeler ve güncel test sonucu: [yeniden inceleme raporu](follow-up-review-2026-10-08.md). Bu belgenin doğrulama bölümü ilk uygulama aşamasının kaydıdır.

Tarih: 8 Ekim 2026. Başlangıç: `main` üzerindeki `7f84526`; `origin/main` fetch ve fast-forward pull sonrasında `3a62c1a` (`Merge administration panels with connected commerce backend`). Bu rapor, yeni panel ekranlarını içeren bu commit üzerine geliştirilen değişiklikleri açıklar. Önceki [1 Ekim raporu](implementation-review.md) tarihsel kayıttır.

## 1. İnceleme ve kapsam

Frontend rotaları, ekranların kullandığı mock veriler, localStorage/session state, form submit işleyicileri ve mevcut backend endpointleri karşılaştırıldı. Güncel ağaçta 92 `page.tsx` bulunuyor; bunların ikisi bu aşamada eklenen şifre sıfırlama ve ekip daveti sayfalarıdır. Rota envanteri aşağıdadır.

Yeni frontend commitindeki yönetim ekranlarının çoğu API kullanmıyordu. Mağaza sayfalarının bir kısmı yalnız üç örnek mağazanın slug'ını tanıyordu. Platform, tedarikçi ve influencer paneli adresleri gerçek sunucu yetkisi olmadan demo provider'ları açıyordu. Profilde örnek kişi, CRM'de yerel kayıtlar ve destek eklerinde base64 bulunuyordu.

Bu aşamada hesap, CRM, ekip, iletişim ve destek akışlarının backend'i ve frontend bağlantıları tamamlandı. Tüm ticari paneller tamamlanmış değildir. Sipariş/ödeme/kargo, ortaklık, finans ve AI akışlarının kalan sözleşme ve sağlayıcı kararları aşağıda ayrı belirtilmiştir. Tasarım, CSS, renkler ve görsel varlıklar değiştirilmedi; veri bağlantıları, işlem durumu, gerçek/demoyu ayıran metinler ve eksik iki akış sayfası eklendi.

## 2. Uygulama sırası ve tamamlanan işler

1. **Güncel commit alındı; frontend/API haritası çıkarıldı.** Mağaza yönetim sayfaları gerçek `server.ts` oturum/kapsam çözümlemesine geçirildi. Yeni açılan gerçek mağaza da profil, CRM, ekip ve destek sayfalarına ulaşabilir.
2. **Kişisel profil bağlandı.** Gerçek hesap adı/e-posta okunur; ad, telefon, şehir ve biyografi version ile güncellenir. E-posta ve ayrıcalıklı rol bu endpoint üzerinden değiştirilemez. Ad sınırı kayıt formuyla aynı 100 karakterdir; daha uzun kayıt ismi profil düzenlerken kesilmeye zorlanmaz. Hesap menüsü gerçek profil kaydını kullanır.
3. **Şifre kurtarma tamamlandı.** Kurtarma formu mevcut SMTP adaptörünü çağırır. `/sifre-sifirla?token=…` şifre eşleşmesini ve token biçimini doğrular. Sunucudaki tek kullanımlık token ve oturum iptali korunur. SMTP ayarsızken 503 gösterilir; gönderilmemiş e-posta için başarı üretilmez.
4. **CRM modülü geliştirildi.** Mağazaya özel müşteri oluşturma, profil/not/iletişim izni güncelleme, e-posta benzersizliği, literal arama, kararlı sıralama, bounded pagination ve ayar sürümleri eklendi. CRM alıcısı, giriş hesabından ayrı koleksiyondur.
5. **CRM iletişim taslakları bağlandı.** Kampanya ve e-posta taslakları MongoDB'de saklanır. Create istekleri UUID idempotency key ile tekrar edilebilir; farklı içerikle aynı anahtar 409 verir. Güncellemeler version kontrol eder. İzinli hedef kitlenin toplamı tüm mağaza kayıtlarından hesaplanır; önizleme en fazla 10 kayıttır. Taslak kaydı gönderim veya kuyruk oluşturmaz.
6. **Destek modülü geliştirildi.** Talep, sunucudan alınan yazar kimliğiyle mesaj, kapatma/yeniden açma, filtre ve sayfalama kalıcıdır. Aynı yanıt isteği iki mesaj oluşturmaz. Eşzamanlı eski version yazması 409 verir. Talep başına en fazla 100 mesaj vardır. İlk sayfa dışında kalan talebe paylaşılmış bağlantıyla ulaşılabilir.
7. **Destek dosyaları özel depolamaya alındı.** Görseller normalize edilip WebP olur; PDF/TXT içerik kontrolü uygulanır. En fazla üç ek ve dosya başına 2 MB. Metadata MongoDB'de, binary kalıcı dosya adaptöründe. Dosya yalnız yetkili oturumla ve indirme response'u üzerinden açılır; ürünlerin public medya servisine çıkmaz.
8. **Destek yanıt taslakları kalıcılaştırıldı.** Taslak mağaza + talep + kullanıcı kapsamında saklanır; başka ekip üyesinin taslağı okunmaz. Sürüm çakışması kaydı ezmez. Yanıt gönderilirken yalnız aynı içerik/eklere sahip kaydedilmiş taslak aynı MongoDB transaction'ında temizlenir; farklı taslak korunur.
9. **Mağaza ekip üyeliği ve RBAC eklendi.** Sahip, editör, destek ve görüntüleyici yetkileri sunucuda ayrıldı. Davet token'ı 7 gün geçerli, tek kullanımlık, DB'de SHA-256 hash olarak saklanır. Daveti yalnız davet edilen e-posta hesabı kabul eder. Rol değişikliği/kaldırma mevcut oturumun sonraki isteğine uygulanır. Sahip dahil 50 koltuk sınırı transaction ve atomik kota kaydıyla korunur.
10. **Platform yetkisi ve destek bağlantısı kuruldu.** `/admin` gerçek DB platform yetkisi gerektirir. Platform destek ekranı mağazanın gerçek platform kanalı taleplerini okur, yanıt ve durum kaydeder; yanıt mağaza panelinde görünür. Platform görevlisi yalnız bu talebe gerçekten bağlanmış özel eki indirebilir. Platform mağaza/başvuru/iletişim listelerinin API'leri hazırdır; bu üç liste için diğer demo ekranlar henüz bağlanmadı.
11. **Genel iletişim formu bağlandı.** Onaylı iletişim talepleri `pending` kaydedilir. Yanıt kamuya kişisel veri içermez. Origin kontrolü ve form trafiği limiti vardır. Otomatik e-posta veya başvuru onayı oluşturmaz.
12. **Regresyon ve entegrasyon testleri genişletildi.** Önceki katalog, mağaza ayarı, stok, medya, sepet ve başvuru testleri korundu. Yeni modüllerin tenant, eşzamanlılık, davet, rol, taslak ve özel dosya sınırları gerçek MongoDB replica set üzerinde kontrol edilir.

## 3. Mimari, veri ve yetki

NestJS modüler monolit korunur: HTTP controller/Zod → application servisleri/portlar → domain modelleri → Mongoose/dosya adaptörleri. Modüller arası çağrılar exported application servislerinden geçer; başka modülün özel repository'sine erişilmez. Yeni alanlar `crm`, `support`, `contact`, `platform`; ekip üyeliği mağaza erişiminin sahibi olan `stores` içindedir. Yeni bağımlılık eklenmedi.

| Veri | Doğruluk kaynağı / kısıt |
| --- | --- |
| Kişisel profil | `User`, `profileVersion`; eski hesaplarda eksik sürüm 0 kabul edilir |
| CRM müşterisi | `CrmCustomer`, unique `(storeId,email)`, version; satış metriği içermez |
| CRM ayarı | `CrmSettings`, unique `storeId`, version |
| İletişim taslağı | `CrmCommunicationDraft`, unique `(storeId,requestId)`, version |
| Destek talebi | `SupportTicket`, UUID, version, en fazla 100 gömülü mesaj |
| Yanıt taslağı | `SupportReplyDraft`, unique `(storeId,ticketId,userId)`, version |
| Özel ek | `SupportFile` metadata; `MEDIA_DIRECTORY/support/<uuid>.bin`, dosya modu 0600 |
| Ekip | `StoreMembership`, unique `(storeId,email)` ve sparse unique tokenHash; aktif userId ilişkisi |
| Ekip kotası | `StoreTeamQuota`, unique storeId; üyelik insert/delete ile aynı transaction |
| İletişim başvurusu | `ContactSubmission`, UUID, pending; yalnız platform yetkilisi listeler |

| İşlem | Sahip | Editör | Destek | Görüntüleyici |
| --- | --- | --- | --- | --- |
| Yönetim genel bakışı / mağazayı okuma | Evet | Evet | Evet | Evet |
| Katalog okuma | Evet | Evet | Hayır | Evet |
| Katalog/medya yazma | Evet | Evet | Hayır | Hayır |
| Mağaza ayarı yazma | Evet | Evet | Hayır | Hayır |
| CRM okuma | Evet | Hayır | Evet | Evet |
| CRM yazma | Evet | Hayır | Evet | Hayır |
| Destek okuma | Evet | Hayır | Evet | Evet |
| Destek/taslak/ek yazma | Evet | Hayır | Evet | Hayır |
| Ekip yönetimi | Evet | Hayır | Hayır | Hayır |

Sahiplik `Store.ownerId` ilişkisinden gelir; sahip rolü bir davet payload'ıyla verilemez. Platform yetkisi bunlardan ayrı `User.platformAdmin` alanıdır. `StoresService.owned` varsayılan olarak yalnız sahibi kabul eder; ekip erişimine açılan endpoint açık capability ister. UI menüsü veya demo rol seçimi yetki kaynağı değildir. Yetkisiz özel kayıt 404, oturumsuz istek 401 verir. Yetki her istekte kontrol edilir; başlamış bir isteğin iptal edilmesi garanti edilmez.

Özel/veri taşıyan response'lar no-store; istemci sözleşmeleri Zod ile doğrulanır. Aramalar MongoDB operatörü/serbest regex kabul etmez. Harcama, sipariş, sadakat, komisyon ve sepet metrikleri istemciden yazılamaz. Finans verisi bulunmadığında UI `—` gösterir; CRM compatibility response'undaki sıfır alanlar `metricsAvailable:false` ile gelir.

Yeni müşteri segmenti `joinedDays <= 30` ile uyumlu 31 günlük zaman aralığıdır. VIP/hareketsiz/sepet/harcama/son sipariş filtreleri için mevcut sipariş kaynağı olmadığından API açık `METRICS_UNAVAILABLE` döndürür. İletişim önizlemesi aynı segmentlerde `available:false,total:null` döndürür.

## 4. HTTP sözleşmesi

Tüm yollar `/api/v1` altında. Yazmalarda izinli `Origin`, özel işlemlerde oturum gerekir. Güncelleme body'leri strict; bilinmeyen alanlar 422. İlgili yazmalarda `version` zorunludur.

| Endpoint | Kapsam / işlev |
| --- | --- |
| GET / PUT `/auth/profile` | Kendi kişisel profili |
| GET `/auth/platform-access` | Mevcut DB platform yetkisi |
| POST `/auth/forgot-password`, `/auth/reset-password` | SMTP kurtarma / tek kullanımlık sıfırlama; mevcut backend |
| GET / POST `/stores/:slug/crm/customers` | Müşteri listesi ve oluşturma |
| PUT `/stores/:slug/crm/customers/:id` | Müşteri güncelleme |
| GET / PUT `/stores/:slug/crm/settings` | Sadakat/hatırlatma ayar taslakları |
| GET `/stores/:slug/crm/communication-recipients?segment=…` | İzinli hedef kitle ve sınırlı önizleme |
| GET / POST `/stores/:slug/crm/communications` | Kampanya/e-posta taslakları; kind ve pagination |
| PUT `/stores/:slug/crm/communications/:id` | Taslak güncelleme |
| GET / POST `/stores/:slug/support` | Filtreli liste / talep oluşturma |
| GET `/stores/:slug/support/:id` | Tek talep; sayfadan bağımsız |
| POST `/stores/:slug/support/:id/replies` | UUID messageId ile idempotent yanıt |
| PUT `/stores/:slug/support/:id/status` | Açık / bekliyor / çözüldü |
| GET / PUT `/stores/:slug/support/:id/draft` | Kullanıcıya özel yanıt taslağı |
| POST `/stores/:slug/support/attachments` | Kontrollü özel dosya yükleme |
| GET `/stores/:slug/support/attachments/:fileId` | Yetkili dosya indirme |
| GET `/stores/:slug/team` | Sahip + davetli/aktif üyeler |
| POST `/stores/:slug/team/invitations` | Hash'li ve süreli davet; ham token yalnız ilk response |
| PUT `/stores/:slug/team/:id` | Version ile görev değiştirme |
| POST `/stores/:slug/team/:id/revoke` | Üyeliği/daveti kaldırma |
| POST `/team/accept` | Davet edilen hesabın token'ı kabulü |
| POST `/contact` | Kamuya açık pending iletişim formu |
| GET `/platform/stores`, `/platform/applications`, `/platform/contacts` | Yalnız platform rolü; bounded listeler, UI bağlantısı bekliyor |
| GET `/platform/support` | Platform kanalı talepler; filtre ve sayfalama |
| GET `/platform/stores/:storeId/support` | Tek mağazanın platform talepleri |
| GET `/platform/stores/:storeId/support/:id` | Platform kanalı tek talep |
| POST `…/:id/replies`, PUT `…/:id/status` | Platform görevlisinin gerçek destek işlemi |
| GET `…/:id/attachments/:fileId` | Yalnız bu platform talebine bağlı ek |

CRM listesi varsayılan 5, destek 20, platform destek UI'sı 8; genel limit üst sınırı 100. CRM sayfa düğmeleri en fazla 5 adet; son sayfa taşması mevcut son sayfaya sıkıştırılır. Liste ve count ayrı sorgulardır; eşzamanlı yeni kayıt altında aynı snapshot garantisi yoktur. CSV tarayıcıda API sayfalarından üretilir; formül kaçırma vardır, eksik satış metrikleri `—` yazılır.

## 5. Yerel kullanım ve dağıtım

Kurulum: [backend README](../README.md). MongoDB replica set zorunludur. Production öncesi mevcut DB'de yeni koleksiyonların unique indekslerini `npm run db:indexes` ile oluşturun. Komut veri/indeks silmez; duplicate hatasında ilerlemeyi durdurur. Eski veriye yıkıcı migration yoktur; boş yeni koleksiyonlar ilk gerçek işlemlerde dolar.

Platform görevlisini sunucuda mevcut, özel bir hesaba yetkilendirin:

```bash
cd backend
npm run admin:role -- grant private-admin@example.com
# Gerektiğinde:
npm run admin:role -- revoke private-admin@example.com
```

Bu komut hesap oluşturmaz ve public API'den rol verme yolu yoktur. Herkese açık seed/demo hesabını platform yöneticisi yapmayın. Bu çalışma sırasında kalıcı demo DB'ye rol veya test verisi eklenmedi. E2E platform hesabı sadece geçici, izole test DB'sinde oluşturulur; üretim seed'ine eklenmez.

Mağaza sahibi `/ekip` ekranında davet bağlantısını hazırlar; kişi `/ekip-daveti?token=…` üzerinden kendi hesabıyla kabul eder. Girişe gidip geri dönme adresi yalnız güvenli mağaza/platform yolları veya tam doğrulanan davet yoludur. Davet ve reset sayfaları noindex/no-referrer kullanır. Davet hazırlamak e-posta göndermez.

Destek dosyaları ürün görsellerinden ayrı, özel klasördedir. `MEDIA_DIRECTORY` ve MongoDB birlikte yedeklenmelidir. Çok instance için dosya adaptörü kalıcı ortak/object storage ile değiştirilmelidir. Mevcut local adaptör geçici container diski üzerinde kullanılmamalıdır.

## 6. Mantıksal boşluklar ve tamamlanmayan kısımlar

1. **Sipariş/ödeme/kargo:** Sepet gerçek ve kalıcı; checkout/sipariş değildir, stok ayırmaz. Manuel sipariş, satın alma anı ürün/fiyat snapshot'ı, rezervasyon, idempotent oluşturma, ödeme ve gönderi/iade state machine'leri eksik. Frontend barkodu gerçek taşıyıcı barkodu veya demo fatura mali belge değildir. Ödeme ve kargo sağlayıcısı, iptal/iade ve stok bırakma politikası seçilmeli.
2. **Finans:** Demo cüzdan/hakediş/aktarım API'ye bağlı değil. Denetlenebilir ledger, komisyon sözleşmesi, tahakkuk ve ters hareketler, para çekme uygunluğu, banka doğrulaması ve mutabakat gerekir. Frontend'in %3 varsayımı gerçek ücret politikası sayılmaz.
3. **Tedarikçi/influencer:** Başvuru kaydı vardır; başvuru onayı ve gerçek hesap/profil/üyelik sahipliği henüz yok. Bu paneller şu an yalnız platform görevlisine açık demo önizlemedir; ilgili işletmenin kendi paneline erişmesi uygulanmış değildir. Bu geçici erişim, eksik sahiplik modeliyle herkese açık admin bırakılmasını önler; ticari onboarding yerine geçmez.
4. **Ortaklık ve mesajlaşma:** Mağaza/tedarikçi/creator demo kayıtları birbirinden bağımsız. Gerçek ilişki kimliği, iki taraflı kabul/iptal, teklif/teslimat onayı, katılımcı yetkisi, mesaj teslimi ve moderasyon servisi gerekir. Demo tedarikçi aktarımı gerçek katalog kaynağını güncellemiyor.
5. **Yorumlar:** Sipariş/ortaklık ilişkisinin doğrulanması, kimlerin değerlendirebileceği, moderasyon ve ortak puan kaynağı yok. Public/demo yorumlar güvenilir işlem yorumları sayılamaz.
6. **Vitrin tasarım editörü:** Bölüm/tasarım taslakları localStorage'dadır; gerçek public vitrin render'ına publish edilmez. Mağaza ayar taslağıyla aynı kavram değildir. Version'lı CMS taslağı, asset sahipliği ve yayın snapshot'ı birlikte geliştirilmelidir.
7. **AI stüdyo:** Gerçek provider/job, timeout/iptal, kredi muhasebesi, dosya sahipliği ve üretim çıktısı yok; örnek resim/kredi sayacı kullanılır. Provider seçimi bekliyor.
8. **İletişim teslimi:** CRM ayar/taslakları kalıcıdır; puan kazandırma, terk edilmiş sepet otomasyonu, SMS/e-posta/WhatsApp teslimi, unsubscribe ve outbox/worker yok. Pazarlama izni sunucuda yeniden kontrol edilmeden gönderim eklenmemeli. SMTP şifre kurtarma için yapılandırılabilir; gerçek teslim bu testlerde denenmedi.
9. **Platform kalan UI:** Üye engelleme/doğrulama, başvuru inceleme/onay, iletişim başvurusu kuyruğu, audit, platform çalışan RBAC, finans, referans/kupon, mesaj denetimi, toplu gönderim ve SMTP ayar ekranları demo. Yeni read API'leri bu ekranların tamamını gerçek kılmaz. Platform destek görev ataması/dahili not/öncelik düzenleme de henüz yok; bu alanlar gerçek destek UI'sında disabled.
10. **Bağımsız hesap kaydı:** `/kayit-ol` hâlâ mağaza oluşturur. Yalnız ekip üyesi/alıcı/partner olarak hesap oluşturma seçeneği yok; yeni ekip üyesinin şu an kendi mağazasını da açması gerekir. E-posta doğrulama/hesap türü onboarding'i ayrıca tasarlanmalı. Token kabulünde email eşleşmesi mevcut; e-postanın gerçek sahibinin doğrulanması henüz yok.
11. **Yetki UX'i:** Backend role göre sınırlar; mağaza menüleri henüz capability bazında gizlenmiyor. Görüntüleyici düzenleme düğmesi görebilir ama API reddeder. Platform demo rol önizlemesi gerçek platform çalışan yetkisi değildir. Mağazaya erişim listesi çok üyelik halinde ayrıca paginate edilmeli.
12. **Davet yaşam döngüsü:** Süresi dolmuş davet erişim vermez ama kota içinde kalır; sahip kaldırıp yeni davet hazırlar. Ham token timeout sonrası tekrar getirilemez. Otomatik davet teslimi, süre dolma temizliği ve güvenilir retry/reissue akışı daha sonra gerekir.
13. **Dosya yaşam döngüsü:** Talebe bağlanmamış yüklemeleri temizleyen job yok. PDF başlık/EOF kontrolü tam parser/antivirüs değildir. Zararlı içerik taraması ve retention politikası yayın altyapısıyla eklenmeli. Dosyalar `attachment` olarak servis edilir; inline public render yapılmaz.
14. **Büyüme ve yayın:** IP limiti tek process belleğinde; güvenilir proxy IP aktarımı/ortak limiter gerekir. Büyük CSV export bütün sayfaları istemci belleğinde toplar; geniş veri için streaming/job sınırı gerekir. Büyük listelerde offset yerine cursor gerekebilir. Statik pazarlama sayacı/iddiaları canlı rapor değildir.

## 7. Gerekli olup henüz bulunmayan sayfalar

- Mağaza checkout: müşteri iletişim/adres, teslimat seçimi, ödeme başlatma, ödeme sonucu ve sipariş doğrulama.
- Alıcı hesap/mağaza erişimi: siparişlerim, sipariş/kargo takibi, adreslerim; uygun model seçilirse misafir güvenli sipariş erişimi.
- Alıcının mağazaya destek talebi açması ve kendi konuşmasını görüntülemesi. Mevcut merchant `customer` kanalı manuel kayıt açar; gerçek alıcı kimliği/mesaj girişi değildir.
- Alıcı iade/değişim talebi ve durum takibi; merchant'teki demo form gerçek talep kaynağı değildir.
- Mağaza açmadan ekip üyesi hesabı oluşturma / davetle kayıt.
- Tedarikçi ve influencer başvuru durumunu izleme, onay sonrası hesap etkinleştirme ve sahipli panel onboarding.
- Platform başvuru ve genel iletişim talebi inceleme/kuyruk ekranları. `/admin/destek` mevcut mağaza platform destek ekranıdır; genel iletişim formunun kuyruğu değildir.
- Halka açık tedarikçi dizini/profili ve creator dizini/profili; mevcut `/tedarikci/<slug>/admin` ve `/influencer/<slug>/admin` yönetim adresleridir. `/tedarikci` genel dizini şu an yoktur.
- Gerçek pazarlama gönderimi uygulanınca abonelikten çıkma/iletişim tercihleri sayfası.

Bu aşamada daha önce eksik olan **şifre sıfırlama** ve **ekip daveti kabul** sayfaları oluşturuldu.

## 8. Sonraki geliştirme sırası

1. Mağazasız hesap kaydı, e-posta doğrulama, partner başvuru/onay ve gerçek profil/üyelik modeli.
2. Gerçek partner dizin/katalog, mağaza ilişkisi ve ortak mesaj/teklif/teslimat kayıtları.
3. Sağlayıcı bağımsız checkout/sipariş + stok rezervasyonu; seçilen ödeme adaptörü ve imzalı idempotent webhook.
4. Kargo/iade adaptörleri ve ayrı durum geçişleri.
5. Ledger/komisyon/finance mutabakat; yalnız doğrulanmış hareketlerden bakiye.
6. Vitrin CMS publish, doğrulanmış yorum ve platform kalan yönetim UI bağlantıları.
7. Teslim garantili iletişim worker/outbox, izin/opt-out ve AI provider/job/kredi.

Sağlayıcı adları için soru iletildi; bu çalışma sırasında yanıt gelmedi. Ödeme, kargo, AI veya pazarlama teslimi için hayali başarılı adaptör oluşturulmadı.

## 9. Doğrulama kaydı

Nihai komut sonuçları aşağıda kayıtlıdır. Testler kalıcı demo DB'yi kullanmaz; geçici replica set ve ayrı 3010/4010 servisleri açılır, kapanınca temizlenir. Tarayıcı build'i sonrasında normal API ayarıyla yeniden frontend build oluşturulur. Yeni değişiklikler bu aşamada commit/push edilmedi.

| Kontrol | Sonuç |
| --- | --- |
| Backend ESLint | Geçti |
| Backend TypeScript noEmit | Geçti |
| Backend test | **42/42 geçti**, gerçek geçici MongoDB replica set |
| Backend production build | Geçti |
| Backend Prettier check | Geçti |
| Frontend ESLint | Geçti, uyarısız |
| Frontend production build | Geçti, normal backend API adresiyle |
| Frontend yardımcı testleri | **88/88 geçti** |
| Playwright Chromium | **8/8 geçti**, production frontend + gerçek API/DB |
| Git whitespace / yerel Markdown bağlantıları | Geçti |

Tarayıcı akışları: önceki katalog/ayar/ürün/görsel/vitrin/sepet ve başvuru; yeni kişisel profil, CRM müşteri/iletişim taslağı, özel ek ve yanıt taslağının reload sonrası kalıcılığı, ilk sayfa dışındaki destek deep link'i, ekip daveti → girişe dönüş → role göre erişim → iptal, genel iletişim, ayarsız SMTP/bozuk reset token hatası, platform yanıtının merchant panelinde görünmesi ve platform özel ek indirmesi. Desktop 1280 ve mobil 390 ekran görüntüleri incelendi; mobil yatay taşma ve JS pageerror kontrolü geçti. Görseller `frontend/test-results/` altında, Git dışında.

Testler profil alanlarının ilk API yüklemesi sırasında düzenlemeyi ezebildiği yarış durumunu yakaladı; yükleme/yazma sırasında disabled alanlarla düzeltildi. CRM taslak liste sözleşmesindeki eksik limit alanı da tarayıcı Zod kontrolüyle yakalanıp düzeltildi. İlk davet giriş dönüşü testi genel pazarlama giriş linkini tıklıyordu; gerçek davet linkine scope edilerek gerçek dönüş akışı doğrulandı. Bir son turda test frontend'i 120 saniyelik başlangıç zaman aşımına düştü; doğrudan production build ve harness yeniden çalıştırması başarılı oldu, son 8 test geçti. Bu tek seferlik başlangıç zaman aşımının kök nedeni kesinleştirilmedi; timeout yükseltilerek gizlenmedi.

Test kaynakları kapatıldı; 3000/4000/3010/4010/27017 üzerinde projeye ait açık servis bırakılmadı. Kalıcı demo verileri değiştirilmedi. Kontroller MongoDB 7.0.17 / kurulu Node 20 runtime üzerinde; başka sağlayıcılarda canlı ödeme/kargo/SMTP teslimi doğrulanmış sayılmaz.

## 10. Tüm frontend sayfalarının durum envanteri

“Statik” sayfa için otomatik backend yazılması gerekli değildir. “Demo” gerçek API'ye bağlı olmayan iş/form kayıtlarını belirtir; mağaza sayfalarında gerçek oturum/kapsam kontrolü yine uygulanır. Partner admin “staff demo” yalnız platform görevlisinin önizlemesi anlamındadır.

| URL | Veri / backend durumu |
| --- | --- |
| `/[storeSlug]/admin/ayarlar` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/[storeSlug]/admin/dashboard` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/[storeSlug]/admin/degerlendirmeler` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/destek` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/[storeSlug]/admin/ekip` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/[storeSlug]/admin/finans` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/influencer/[creatorId]` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/influencer` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/kampanyalar` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/mesajlar` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/musteriler` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/[storeSlug]/admin` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/[storeSlug]/admin/profil` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/[storeSlug]/admin/siparisler/[orderId]` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/siparisler` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/studyo` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/tedarik/[supplierId]` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/tedarik/[supplierId]/urun/[productId]` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/tedarik` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/urunler` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/[storeSlug]/admin/vitrin/onizleme` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]/admin/vitrin` | Demo işlem/kayıt; gerçek mağaza erişim kontrolü |
| `/[storeSlug]` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/admin/canli-destek` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/degerlendirmeler` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/destek` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/admin/ekip` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/eposta` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/finans/[accountId]` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/finans` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/influencerlar/[memberSlug]` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/influencerlar` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/is-birlikleri` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/islem-gecmisi` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/magazalar/[memberSlug]` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/magazalar` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/mesajlar/[threadId]` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/mesajlar` | Demo veriler; gerçek platform rol kontrolü |
| `/admin` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/referanslar` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/satislar` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/sms` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/smtp` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/tedarikciler/[memberSlug]` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/tedarikciler` | Demo veriler; gerçek platform rol kontrolü |
| `/admin/uyeler` | Demo veriler; gerçek platform rol kontrolü |
| `/alceix-avantajlari` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/blog/[slug]` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/blog` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/dropshipping-tedarik` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/e-ticarete-basla` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/ekip-daveti` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/giris-yap` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/hakkimizda` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/iletisim` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/influencer/[creatorSlug]/admin/degerlendirmeler` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer/[creatorSlug]/admin/gecmis` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer/[creatorSlug]/admin/kargo` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer/[creatorSlug]/admin/mesajlar` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer/[creatorSlug]/admin` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer/[creatorSlug]/admin/portfoy` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer/[creatorSlug]/admin/profil` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer/[creatorSlug]/admin/teklifler/[offerId]` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer/[creatorSlug]/admin/teklifler` | Staff demo; gerçek partner sahipliği henüz yok |
| `/influencer-ol` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/is-birlikleri` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/is-ortaklarimiz` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/kayit-ol` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/magaza-ve-vitrin` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/neden-alceix` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/platform-ozellikleri` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/satis-modelleri` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/sifre-sifirla` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/sifremi-unuttum` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/sss` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/tedarikci/[supplierSlug]/admin/ayarlar` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/degerlendirmeler` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/destek` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/ekip` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/entegrasyon` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/finans` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/magazalar` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/mesajlar` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/siparisler/[orderId]` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/siparisler` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/studyo` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci/[supplierSlug]/admin/urunler` | Staff demo; gerçek partner sahipliği henüz yok |
| `/tedarikci-ol` | Gerçek API; yukarıdaki özellik sınırları geçerli |
| `/urun-vitrinleri` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
| `/yardim-destek` | Statik içerik; varsa başvuru CTA ayrı gerçek form |
