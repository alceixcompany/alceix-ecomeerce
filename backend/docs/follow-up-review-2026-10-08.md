# Yeniden inceleme ve hata düzeltmeleri — 8 Ekim 2026

> Güncel kapsam/eksikler: [13 Ekim 2026 raporu](implementation-review-2026-10-13.md). Bu belgedeki önceki eksikler tarihsel durumu anlatır.
Sonraki geliştirme ve güncel eksikler: [9 Ekim raporu](implementation-review-2026-10-09.md). Bu belge önceki aşamanın tarihsel kaydıdır.

## Kapsam

`main` üzerindeki `3a62c1a` ve önceki çalışmadan kalan yerel değişiklikler birlikte incelendi. Bu incelemede yeni commit çekilmedi veya GitHub'a push yapılmadı. Frontend görünümü, CSS ve görsel varlıklar korunuyor.

92 frontend sayfasının [mevcut durum envanteri](implementation-review-2026-10-08.md#10-tüm-frontend-sayfalarının-durum-envanteri) ile backend controller/service/repository sözleşmeleri karşılaştırıldı. Özellikle mağaza izolasyonu, ekip yetkileri, public/private yanıtlar, kayıt tekrarları, version kontrolleri, taslak kalıcılığı ve hata sonrası arayüz davranışı incelendi.

## Bulunan ve düzeltilen hatalar

| Öncelik | Hata ve etkisi | Düzeltme / doğrulama |
| --- | --- | --- |
| P1 | `sifremi-unuttum` mağaza slug'ı olarak kaydedilebiliyordu. Public URL mağaza yerine şifre kurtarma sayfasını açıyordu. | Ayrılmış rotalara eklendi. Gerçek MongoDB testi düzeltme öncesi 409 beklerken 200 aldı; düzeltme sonrası ayar ve taslak kayıtları reddediliyor, mağaza adresi/version değişmiyor. Sıfırlama ve davet rotaları da aynı testte korunuyor. |
| P2 | İletişim taslağı düzenlendikten sonra ilk oluşturma isteğinin tekrarı 409 veriyordu. Idempotency karşılaştırması düzenlenebilir içerik üzerinden yapılıyordu. | İlk oluşturma girdisi ayrı ve değişmez `initialInput` olarak saklanıyor. Tekrar, ilk girdiyi doğrulayıp aynı kaydın güncel halini döndürüyor. Farklı girdi aynı requestId ile reddediliyor. Gerçek DB regresyonu önce başarısız, sonra başarılı. |
| P2 | Destek yanıtının tekrarında kullanıcı kimliği kontrol edilmiyordu. Aynı mağazadaki başka bir destek yetkili üye, görünen messageId ve aynı içeriği kullanarak kendi yanıtı kaydedilmiş gibi başarı alabiliyordu. | Mesaja sunucu tarafından `actorId` ekleniyor; tekrar yalnız aynı kullanıcı ve içerikle kabul ediliyor. İsim değişikliği tekrarı bozmaz. Kullanıcı kimliği merchant/platform HTTP yanıtlarından çıkarılıyor. Gerçek DB testi başka üyeyi reddediyor ve aynı kullanıcının tekrarında ikinci mesaj oluşmadığını kontrol ediyor. Bu hata başka mağazaya erişim sağlamıyordu. |
| P2 | Destek yanıtı kalıcılaştıktan sonra taslak GET isteği başarısız olursa ekranda yanıt gönderimi başarısızmış gibi hata görünüyordu. Eski taslak sürümüyle sonraki kayıt da çakışabiliyordu. | Kalıcı yanıt sonucu ile takip okuması ayrıldı. Yanıt başarı bildirimi korunuyor; bilinmeyen taslak sürümü geçersizleştirilip okuma yenileniyor. Okuma tamamlanana kadar yanıt/taslak kontrolleri disabled. Playwright'ta bu GET isteğine bir kez 503 verilerek toparlanma, sonraki taslak kaydı ve yeniden yükleme kontrol edildi. |
| P2 | Sunucuda başka içerikli bir yanıt taslağı korunmasına rağmen yanıt gönderiminden sonra UI onu boş gösteriyordu. Kullanıcı mevcut taslağını göremiyordu. | Gönderim sonrası gerçek taslak metni, ekleri ve version birlikte yükleniyor. Farklı kayıtlı taslak ekranda da korunuyor; eşleşen taslak temizleniyor. Aynı tarayıcı regresyonu iki durumu da kontrol ediyor. |
| P2 | Kampanya penceresinin kapanmış veya yeniden açılmış eski yüklemesi yeni penceredeki state'i değiştirebiliyordu. | Önceki okuma yeni pencere açılışında, kapatmada ve unmount'ta iptal ediliyor. İptal edilmiş/kapalı penceredeki sonuç uygulanmıyor. Lint/build ve mevcut kampanya oluşturma-yeniden yükleme tarayıcı akışı geçti; gecikmiş pencere yarışı için ayrı kontrollü tarayıcı testi eklenmedi. |

Tedarikçi modülü README'sindeki “yerel aktarım Ürün Yönetimi'nde görülebilir” ifadesi de düzeltildi. Gerçek Ürün Yönetimi API kataloğunu okuyor; demo tedarikçi aktarımı yalnız localStorage kataloğuna yazıyor.

## Eski verilerle uyum

- `initialInput` olmayan taslaklarda bu sürümle yapılacak ilk düzenleme, o anki girdiyi aynı atomik update içinde korur. Daha önceki bir sürümde düzenlenip özgün oluşturma girdisi kaybolmuş kayıtların ilk içeriği geriye dönük çıkarılamaz; bu kayıtlar için eski ilk isteğin tekrarı hâlâ çakışabilir. Kullanıcı verisi yeniden yazılmadı/silinmedi.
- `actorId` olmayan eski destek mesajları yeni bir aktöre tahminen bağlanmaz. Bu eski mesaj kimliklerinin tekrarına 409 verilir. Yeni mesajlar doğru kullanıcıya bağlıdır; eski konuşmalar okunmaya devam eder.
- Önceden ayrılmış bir rota ile çakışan mağaza mevcutsa slug düzeltmesi gerekir. Bu incelemede kalıcı demo/üretim DB'sine dönüşüm uygulanmadı.

## Hâlâ tamamlanmayan işler

Bu alanlar hata düzeltmesiyle tamamlanmış sayılmıyor; ilgili frontend'ler çoğunlukla demo veya yerel kayıtlardır:

1. **Checkout, sipariş, ödeme, kargo ve iade:** Gerçek sepet var; sipariş ve stok rezervasyonu yok. Satın alma snapshot'ı, ayrı durum geçişleri, ödeme/webhook ve taşıyıcı adaptörleri gerekli. Varyantlar seçenek isimleri; ayrı varyant SKU/fiyat/stok modeli yok.
2. **Tedarikçi/influencer sahipliği:** Başvurular kayıtlı; onay ve gerçek partner hesabı/panel sahipliği yok. Bu paneller platform görevlisi için demo önizleme. Partnerin kendi panelini kullanması henüz sağlanmıyor.
3. **Finans/komisyon:** Ledger, tahakkuk, para çekme, banka doğrulaması ve mutabakat eksik. Ekrandaki demo bakiyeler gerçek bakiye değil.
4. **Ortaklık, mesaj, kampanya başvuruları ve doğrulanmış yorumlar:** Ortak ilişki/katılımcı yetkisi ve kalıcı işlem kayıtları gerekli. Tedarikçi demo aktarımı gerçek mağaza kataloğuyla bağlı değil.
5. **Vitrin editörü ve AI:** CMS taslak/yayın modeli ve gerçek vitrin render bağlantısı; AI sağlayıcısı/job/kredi muhasebesi eksik.
6. **İletişim gönderimi:** CRM kampanya/e-posta kaydı taslak; gerçek gönderim, unsubscribe, teslim kuyruğu ve otomasyon yok. SMTP yapılandırması olmadan şifre kurtarma 503 döner. Gerçek e-posta teslimi bu testlerin kapsamında değil.
7. **Hesap onboarding'i:** Mağaza açmadan ekip/alıcı/partner kaydı ve e-posta sahipliği doğrulaması yok. Davet token'ı e-posta eşleşmesiyle korunuyor; bu, e-postanın sahibinin doğrulandığı anlamına gelmez.
8. **Platform kalan ekranları:** Başvuru/iletişim okuma API'leri var; inceleme/onay kuyruklarının UI bağlantıları, audit ve çalışan RBAC tamamlanmadı. Destek görev ataması, dahili not ve öncelik düzenleme yok.
9. **Yetki arayüzü:** Backend reddediyor; ekip capability'lerine göre menü/buton görünürlüğü henüz ayrılmadı. Görüntüleyici düzenleme düğmesi görebiliyor.
10. **Yaşam döngüsü/ölçek:** Süresi dolan davet temizliği ve yeniden gönderim; kullanılmayan medya/özel ek temizliği; büyük CSV streaming/sınırları; çok instance ortak limiter ve kalıcı object storage gerekiyor. Manuel stok artırma dahil her yazma endpointinin tekrar koruması olduğu varsayılmamalı; mevcut idempotency sözleşmeleri iletişim oluşturma ve destek yanıtlarıyla sınırlı.

Eksik sayfalar: checkout/ödeme sonucu; alıcı sipariş ve kargo takibi/adres/iade/destek; mağazasız davetle kayıt; partner başvuru durumu/onboarding; public partner dizin/profilleri; platform başvuru/iletişim inceleme; gerçek gönderim eklendiğinde iletişim tercihleri. Ayrıntılar [önceki raporun eksik sayfalar bölümünde](implementation-review-2026-10-08.md#7-gerekli-olup-henüz-bulunmayan-sayfalar).

Öncelik: gerçek hesap/partner sahipliği ve doğrulama → sipariş/stok rezervasyonu/ödeme → kargo/iade → finans → kalan panel bağlantıları. Sağlayıcı veya iş sözleşmesi seçimi gereken kısımlar bu incelemede hayali başarılı backend ile doldurulmadı.

## Doğrulama

- Backend: **45/45 test geçti**; gerçek geçici MongoDB replica set, tenant/rol, constraint, CAS, transaction ve tekrar testleri. Üç yeni test eklendi.
- Frontend yardımcıları: **88/88 test geçti**.
- Playwright Chromium: **9/9 test geçti**. Yeni senaryo gerçek backend/DB ile farklı taslağın korunmasını ve yalnız takip GET'ine verilen kontrollü 503 sonrası kaydın toparlanmasını doğruluyor. Son yanıtlarda tam üç mesaj var; takip okuması hatası yeni bir çift yanıt oluşturmuyor.
- Backend lint, typecheck, build ve format kontrolü; frontend lint ve production build başarılı. `git diff --check` temiz.
- Frontend'deki 23 statik kök sayfa adı ayrılmış mağaza slug listesiyle karşılaştırıldı; eksik kalmadı. Partner namespace'leri de mevcut ayrılmış listede.
- İlk yeni tarayıcı denemesinde genel `getByRole("status")` sorgusu hem yükleme metnini hem bildirimi seçti. Test, gerçek bildirim alanına daraltıldı. Bu denemede ayrıca okuma sürümü bilinmeden açık kalan taslak kontrolleri kapatıldı; tekrar çalıştırmada dokuz test geçti.
- Tarayıcı harness'i sonrası normal frontend build yeniden üretildi. API rewrite yeniden port 4000'e dönüyor; test portu 4010 teslim build'inde kalmıyor.
- Kalıcı demo DB'si ve gerçek kullanıcı kayıtları kullanılmadı. Test sunucuları/Mongo fixture'ları kapandı; 3000/4000/3010/4010/27017 portlarında bu projeden servis bırakılmadı.

Bu sonuç, mevcut test kapsamının geçtiğini gösterir; henüz uygulanmayan ticari akışların çalıştığı veya dış ödeme/kargo/e-posta sağlayıcılarının doğrulandığı anlamına gelmez.
