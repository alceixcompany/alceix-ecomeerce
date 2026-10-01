# Backend geliştirme kuralları

Bu belge `backend/` altındaki geliştirmelerin ortak kural kaynağıdır. İnsan geliştiriciler ve kodlama araçları uygulama, test, veri modeli ve entegrasyon çalışmalarında bu kuralları izler. Kullanıcının açık talimatları önceliklidir; kalıcı bir karar değiştiğinde bu belge de güncellenir.

## 1. Kapsam ve kararların durumu

- Hedef, mevcut frontend'in ihtiyaç duyduğu gerçek backend'i geliştirmektir. Frontend'in mevcut tasarımı, yerleşimi ve görsel varlıkları korunur. Kullanıcının 2026-10-01 isteği kapsamında yükleme skeleton/shimmer efektleri ve sayfalama/filtre kontrolleri eklenebilir; bu izin genel yeniden tasarım anlamına gelmez. Veri entegrasyonu yapıldığında mevcut tasarım korunur ve `frontend/AGENTS.md` de uygulanır.
- Mevcut frontend alanlarını incelemeden endpoint veya veri modeli tasarlama. Demo metinleri ve menü başlıkları tek başına kesin ürün gereksinimi değildir.
- Başlangıç mimarisi iş alanlarına ayrılmış modüler monolittir: tek uygulama içinde açık sorumluluklar ve kontrollü modül iletişimi. Somut ihtiyaç oluşmadan mikroservis, olay altyapısı, kuyruk veya ikinci veritabanı ekleme.
- Veritabanı MongoDB olarak kullanıcı tarafından seçildi. TypeScript + NestJS + Mongoose uygulanmıştır. Sürümler için package.json ve lock dosyasını esas al. Gerekçeler docs/decisions/001-backend-foundation.md içindedir; MongoDB seçimini sessizce değiştirme.
- Bu dosyada gelecekteki iş akışları için verilen kurallar, bu özelliklerin tamamının hemen geliştirileceği anlamına gelmez. Yeni rol, ödeme yöntemi, tedarikçi veya satış modeli uydurma.
- İlgisiz dosyaları değiştirme. Gerçek kullanıcı verisini değiştiren veya silen veri dönüşümlerini geliştirme ortamındaki örnek veri işlemleriyle karıştırma.

## 2. Modüler yerleşim

Klasörleri gerçek ihtiyaç oluştuğunda ekle; boş şablon modülleri oluşturma.

```text
src/
  main.ts                       # Uygulamayı başlatma
  app.module.ts                 # modülleri bağlama
  config/                       # Doğrulanan ortam yapılandırması
  infrastructure/               # Ortak DB bağlantısı ve teknik altyapı
  shared/                       # Gerçekten ortak teknik sözleşmeler
  modules/
    <feature>/
      presentation/             # Controller, HTTP DTO, response eşleme
      application/              # Kullanım senaryoları ve ihtiyaç duydukları portlar
      domain/                   # Alan modeli, değişmezler, iş kuralları
      infrastructure/           # Repository ve dış servis adaptörleri
      <feature>.module.ts       # modülün bağımlılıklarını bağlama
test/                           # Modüller arası entegrasyon ve uçtan uca testler
docs/
  decisions/                    # Kesinleşen önemli mimari kararlar
```

- Bu yerleşim sorumlulukları tanımlar; her basit işlem için dört ayrı sınıf zorunlu değildir. İş kuralı olmayan basit alanlar daha az dosyayla aynı bağımlılık sınırlarını koruyabilir.
- Normal dosya/klasör ve kod adlarını tutarlı İngilizce yaz. Dosyalar `kebab-case`, sınıf/tipler `PascalCase`, fonksiyon/değişkenler `camelCase` kullanır.
- Auth, kullanıcılar, mağazalar, katalog, stok, medya, başvurular gibi modülleri ihtiyaçları gerçekleştikçe ekle. Sipariş, ödeme ve diğer operasyon alanlarının sahibi kendi modülüdür.
- Ortak bir iş kavramının tek sahibi olur. `shared/` içine mağaza, ürün, sipariş ve ödeme servislerini taşıma; ilgisiz yardımcıları burada biriktirme.

## 3. SOLID ve bağımlılık sınırları

- **S — Tek sorumluluk:** Controller HTTP girdisini/çıktısını yönetir; kullanım senaryosu işlemi koordine eder; alan modeli iş kurallarını taşır; repository veri erişimini gerçekleştirir. Bir sınıfa bu sorumlulukların tamamını yükleme.
- **O — Genişlemeye açıklık:** Gerçekten değişebilen ödeme, kargo, medya veya tedarikçi davranışlarını küçük sözleşmeler ve adaptörlerle ayır. Her yeni sağlayıcı için merkezi servislere büyüyen koşul zincirleri ekleme; gelecekte olabilir diye kullanılmayan stratejiler de oluşturma.
- **L — Yerine geçebilme:** Aynı portun uygulamaları hata, bulunamayan kayıt, atomiklik ve yan etki sözleşmelerini korur. Test adaptörü gerçek adaptörün sağlamadığı başarı davranışını uydurmaz.
- **I — Küçük sözleşmeler:** Tüketicinin ihtiyacı olan işlemleri tanımla. Her modülün bütün CRUD işlemlerini uygulamasını zorunlu kılan genel repository arayüzleri oluşturma.
- **D — Bağımlılıkların tersine çevrilmesi:** İş mantığı MongoDB/Mongoose, SQL/ORM veya dış sağlayıcı SDK'sına doğrudan bağımlı olmaz. Kullanım senaryosunun ihtiyaç duyduğu veri erişimi ve dış servis portları adaptörlerle sağlanır; uygulama başlangıcında dependency injection ile bağlanır.
- Domain kodu HTTP, NestJS, ORM, ortam değişkenleri ve ağ istemcilerinden bağımsızdır. Application katmanı transport DTO veya veritabanı document/entity tiplerini iş modeli olarak kullanmaz.
- DTO, alan modeli, saklama modeli ve response arasındaki eşlemeyi sınırda yap. Framework/ORM ayrıntılarını frontend'e taşıma.
- Modüller yalnızca açıkça dışa aktarılan uygulama sözleşmeleri üzerinden haberleşir; başka modülün repository'sine, koleksiyonuna/tablosuna veya özel dosyalarına doğrudan erişmez.
- Döngüsel bağımlılıkları sahiplik ve kullanım senaryolarını düzelterek çöz. `forwardRef` kullanarak mimari döngüyü kalıcı hale getirme.
- Framework seçildiğinde kurulu sürümün resmi belgelerini esas al. TypeScript arayüzleri runtime'da bulunmadığından DI bağlantılarında gerektiğinde açık injection token kullan.

## 4. Birbirine bağlı iş alanları

- Kullanıcının mağaza, tedarikçi ve influencer adres modeli `docs/decisions/002-platform-routes-and-catalogue-performance.md` içinde kayıtlıdır. Mağaza yönetimi mevcut; tedarikçi/influencer panelleri ayrıca geliştirilecek. Ayrılmış namespace slug'larını mağaza adresi olarak kullanma.

- Mağaza sahipliği, kullanıcı ile mağaza arasındaki açık ilişki üzerinden belirlenir. Kullanıcı hesabı, mağaza yönetim üyeliği ve alışveriş müşterisi kavramlarını sebepsiz yere tek kayıt/rol altında birleştirme.
- Admin ve halka açık vitrin aynı mağaza ve katalog kayıtlarını kullanır. Ayrı demo katalogları veya iki bağımsız gerçek ürün kaynağı oluşturma.
- Ürün mağazaya; kategori ilgili kapsamına; stok ilgili ürün/varyanta bağlanır. Başka mağazanın kategorisini, ürününü, medyasını veya stoğunu aynı işleme bağlama.
- Bir ürünü yayınlama, taslak kaydetme ve satıştan kaldırma davranışları açıkça tanımlanır. Vitrin yalnızca yayınlanmasına izin verilen kayıtları gösterir.
- Başvurular hesap, mağaza veya aktif ortaklık değildir. Bir başvurunun gönderilmesi kendiliğinden yetki veya onaylanmış tedarikçi/influencer kaydı oluşturmaz.
- Sipariş geliştirilirken ürün kimliğine ek olarak satın alma anındaki ad, SKU/varyant, fiyat, para birimi, indirim ve gerekli toplam bilgilerini snapshot olarak sakla. Sonradan ürün güncellenmesi geçmiş siparişi değiştirmez.
- Sipariş, ödeme, gönderi ve iade durumları ayrı modellerdir. Geçişleri açıkça tanımla; bir `status` alanıyla bütün süreçleri temsil etme.
- Dashboard mevcut iş kayıtlarından türetilir. Gösterilen bakiye, satış, stok veya müşteri sayılarını bağımsız elle güncellenen ikinci doğruluk kaynağı yapma.

## 5. Veri modeli ve tutarlılık

- Kalıcı kimlikleri ilişkilerde kullan. Slug yalnızca mağazayı çözümlemek içindir; yetki kanıtı değildir. Slug biçimi, benzersizliği, ayrılmış rotalar ve değişiklik yönlendirmeleri tek sözleşmede tanımlanır.
- E-posta normalizasyonu ve benzersizlik politikası, mağaza slug'ı ve mağaza kapsamındaki SKU gibi kısıtları tanımla. Önce sorgulayıp sonra eklemek tek başına yeterli değildir; veritabanında uygun unique constraint/index kullan ve çakışmayı anlamlı hataya dönüştür.
- Listeleme/arama sorgularını ve indekslerini birlikte tasarla. Sayfa boyutuna üst sınır koy, kararlı sıralama kullan; veri büyüdüğünde bütün kayıtları belleğe alıp filtreleme yapma.
- Para, küçük para biriminde tamsayı ve para birimi koduyla veya gerekçesi belgelenmiş kesin ondalık tip ile tutulur. JavaScript kayan nokta hesabını ödeme/komisyon doğruluğunun temeli yapma; güvenli sayı aralıklarını ve yuvarlama politikasını doğrula.
- Zaman damgalarını UTC olarak sakla ve API'de açık saat dilimli ISO biçimi kullan. Tarih-only değerleri zaman damgasından ayır.
- Stok azaltma/rezervasyonunu yeterli stok koşuluyla atomik yap. Eş zamanlı son ürün siparişlerinde negatif stok ve çift satış oluşmamalıdır.
- Birlikte başarılı olması gereken kayıt değişikliklerinin transaction sınırı kullanım senaryosunda belirlenir. Veritabanı transaction'ı dış ödeme veya kargo API'sini atomik hale getirmez; dış işlemlerin hata, yeniden deneme ve uzlaştırma davranışlarını tasarla.
- İndeksler, veri dönüşümleri ve şema değişiklikleri sürümlenir. Migration tekrar çalıştırma, geri dönüş/ileri düzeltme ve mevcut veriye etkisiyle birlikte değerlendirilir. Üretimde otomatik yıkıcı schema synchronization kullanma.
- Kayıt silme/arşivleme ve saklama kararını ilişkileriyle birlikte ver. Sipariş/finans geçmişini ürün silinmesiyle zincirleme silme; her kayıt için otomatik soft-delete ekleme.

### MongoDB uygulama kuralları

- Mongoose veya driver erişimi persistence adaptörlerinde kalır. Şema, runtime doğrulama ve indeksler açıkça tanımlanır; MongoDB esnekliği şemasız uygulama anlamına gelmez.
- Mağazanın bütün ürünlerini, siparişlerini, stok hareketlerini veya takipçilerini sınırsız büyüyen tek document dizisine gömme. Birlikte okunan, sınırları belli alt değerleri göm; bağımsız yaşam döngüsü ve büyüyen ilişkiler için referans kullan.
- Çok document'lı transaction gereken geliştirme, test ve üretim ortamları replica set veya desteklenen sharded cluster kullanır. Standalone MongoDB üzerinde transaction çalışıyormuş gibi başarı üretme.
- Referansların varlığı ve mağaza kapsamı uygulamada korunur; Mongoose `ref`/`populate` foreign key garantisi olarak kabul edilmez. Eş zamanlı silme/güncelleme davranışını da tasarla.

## 6. API ve frontend sözleşmesi

- Endpoint, DTO, hata modeli ve erişim kapsamını ilgili frontend alanlarıyla birlikte belirle. Backend framework'üne göre mevcut frontend'i yeniden tasarlama.
- API sürümleme yaklaşımını ilk endpointlerle kaydet; route adlarını tutarlı tut. OpenAPI belgesi gerçek uygulama sözleşmesiyle aynı kalır.
- İstemciden gelen body, params, query ve dış servis verilerini runtime'da doğrula. Tipler ve ORM şeması HTTP doğrulamasının yerine geçmez.
- Güncellenebilir alanları açıkça seç; gelen body'yi doğrudan persistence modeline yayma. Kullanıcı `storeId`, rol, bakiye, ödeme sonucu veya sahipliği keyfi değiştiremez.
- Veritabanı sorgu operatörlerini ve serbest filtre nesnelerini istemciden kabul etme. Güvenli parametreli sorgular ve açık filtre alanları kullan.
- Response alanlarını açıkça eşle; şifre hash'i, oturum anahtarı, iç sağlayıcı bilgileri ve mağaza maliyeti gibi özel verileri public vitrine gönderme.
- Hatalarda tutarlı HTTP status, uygulama hata kodu, güvenli kullanıcı mesajı, gerekiyorsa alan hataları ve request ID kullan. Stack trace veya ham DB/SDK hatasını gönderme.
- Yazma sonucu kalıcılaşmadan başarı response'u üretme. Gerçek API hatasında sessizce demo/mock başarıya dönme.
- Listeleme sözleşmesi filtreler, sıralama, sayfalama ve gereken toplam/sayaç bilgilerini açıkça belirtir. CSV'nin tarayıcıda üretilmesi zorunlu bir backend export servisi oluşturmayı gerektirmez.

## 7. Kimlik doğrulama ve mağaza izolasyonu

- Oturum stratejisini ilk auth uygulamasında açıkça belgeleyip tek şekilde uygula. Şifreler güvenilir password-hashing kütüphanesiyle hash'lenir; açık metin veya geri çözülebilen şifre saklama.
- Her korumalı kullanım senaryosu kimlik ve işlem yetkisini doğrular. Menü gizlemek, `noindex`, slug bilgisi ve frontend kontrolü erişim güvenliği değildir.
- Mağaza kapsamını doğrulanmış oturum/üyelikten üret; URL/body/header içindeki `storeId` veya slug'a tek başına güvenme. Repository sorgularında doğrulanmış mağaza kapsamı bulunur.
- Public vitrin sözleşmesi yönetim erişiminden ayrıdır. Public lookup'un bulunması aynı mağazanın özel kayıtlarını okumaya izin vermez.
- Çerez oturumu kullanılıyorsa HttpOnly/Secure/SameSite, CSRF ve origin kontrollerini birlikte ele al. CORS'u gerçek frontend origin'leriyle sınırla; CORS'u yetkilendirme kabul etme.
- Giriş, kayıt, şifre sıfırlama ve açık başvuru endpointlerinde somut trafik/istismar riskine uygun oran ve boyut sınırlarını uygula.
- Şifre sıfırlama token'ları süreli, tek kullanımlık ve güvenli saklanır. Hassas hesap varlığını açıklayan response'lar üretme; oturum iptali ve süresinin dolmasını ele al.
- Secret, şifre, oturum token'ı ve gereksiz kişisel veriyi loglama. Kullanıcılar/mağazalar arasında cache anahtarları ve geçici durumlar karışmaz.

## 8. Medya ve dış servisler

- Ürün ve mağaza dosyalarını production'da uygun kalıcı dosya/object storage üzerinden yönet; DB'de dosya kimliği ve metadata sakla. Frontend'in base64/blob demo depolamasını gerçek backend modeli yapma.
- Dosya türü, içeriği, boyutu ve sahipliği sunucuda doğrulanır. İstemcinin dosya adı/MIME beyanı tek başına yeterli değildir. Mevcut frontend sınırlarıyla uyumu koru; farklılaştırma gerekiyorsa sözleşmede kaydet.
- Sağlayıcı SDK'ları küçük adaptörlerde kalır; iş mantığı sağlayıcı response'una bağlanmaz. Timeout, hata eşleme ve güvenli retry politikaları açık olur.
- E-posta, medya ve ödeme gibi harici işler için transaction sonrası hata/temizleme davranışını tasarla. Kalıcı garantili teslimat ihtiyacı doğduğunda outbox/worker kullan; süreç belleğindeki işi garantili işlem gibi sunma.
- Tedarikçi URL'lerinden sunucu tarafı içerik alındığında SSRF sınırlarını uygula; istemci girdisiyle iç ağlara erişim verme.
- Ödeme webhook'larında sağlayıcı imzasını doğrula. Tekrarlanan veya sırası değişen olaylar çift sipariş, stok azaltma veya bakiye hareketi oluşturmaz.
- Sipariş, ödeme, iade ve finans yazmaları gerektiğinde idempotency key, işlem kapsamı ve veritabanı benzersizlik kısıtıyla korunur. Anahtarın farklı payload ile tekrarını kontrol et.
- Finans uygulandığında bakiye tek başına değiştirilen sayı değildir; denetlenebilir hareketlerden türetilir. Düzeltme/iade önceki hareketi gizlice değiştirmek yerine izlenebilir ters/düzeltme hareketi oluşturur.

## 9. Yapılandırma ve çalışma ortamı

- Ortam ayarlarını başlangıçta doğrulanan tek config katmanından oku. İş servislerinde dağınık `process.env` erişimi kullanma.
- Gereken değişkenleri güvenli örneklerle `.env.example` içinde belgele; gerçek `.env` ve secret'ları commit etme. API URL'si, CORS origin'i, DB ve sağlayıcı ayarları koda sabitlenmez.
- Desteklenen runtime ve paket yöneticisi seçimini belgeleyip lock dosyasını commit et. Repository'nin npm düzeniyle uyumlu ilerle; gereksiz ikinci paket yöneticisi ekleme.
- Ek bağımlılığı somut ihtiyaca göre seç. Başlangıçta Redis, Elasticsearch veya birden fazla ORM kurma.
- Liveness ve gerekli altyapının hazır olduğunu gösteren readiness kontrollerini ayır. Uygulama kapanırken bağlantıları ve devam eden işleri kontrollü kapat.
- HTTP/DB işlemlerinde süre ve boyut sınırları; loglarda request ID ve işlem bağlamı bulunur. Sağlık ve hata çıktıları secret içermez.

## 10. Test ve teslim ölçütleri

- Her özellik için veri sahibi, kullanım senaryosu, API sözleşmesi, erişim kapsamı ve hata durumları belirlenir. Küçük işlemler için gereksiz mimari belge oluşturma.
- İş kurallarına unit test; repository, indeks/constraint ve transaction davranışına seçilen gerçek veritabanıyla entegrasyon testi ekle. Mock testinin veritabanı garantisini doğruladığını iddia etme.
- Kritik akışlarda uçtan uca test kullan: kayıt/giriş ve yetkisiz erişim, başka mağazanın kaydına erişim, ürünün admin'den vitrine yansıması, yayın durumları ve uygulandığında stok/ödeme akışları.
- Eş zamanlı son stok satışı, benzersizlik çakışması ve tekrarlanan webhook/idempotency testlerini ilgili özellik geliştirildiğinde ekle. Testler yalnızca controller/service implementasyonunu tekrar etmez.
- Backend kurulduğunda lint, typecheck, test ve build scriptleri tanımlanır. Çalıştırılabilir değişiklikten sonra ilgili kontroller ve kritik entegrasyon testleri çalıştırılır; çalışmayan kontrol tamamlanmış gibi raporlanmaz.
- Frontend entegrasyonunda `frontend/AGENTS.md` kontrolleri uygulanır; mevcut görünümün korunduğu uygun ekran/akışlarla kontrol edilir.
- Demo/seed verileri açıkça geliştirme/test ortamıyla sınırlandırılır. Production hatalarında mock adapter'a geçme; production'u otomatik demo veriyle doldurma.
- `db:seed` yalnız yerel `alceix_demo` veritabanında çalışır; production, uzak bağlantı ve başka veritabanı adını başlangıçta reddeder. Seed uygulama servislerini kullanır, mevcut hesap/ayar/ürün/stoğu ezmez veya veri silmez. Tekrar çalıştırmada tüm katalog sayfalarını tarayıp yalnız eksik örnek SKU'ları ekler. Bu garantiler gerçek geçici replica set ile test edilir; seed testi harici test bağlantısını kullanmaz.
- Kalıcı yerel demo DB'si, yüklenen medya, ortam dosyaları ve tarayıcı çıktıları Git dışında kalır. Depoda yalnız açıkça demo olarak belgelenen hesaplar, seed kodu ve güvenli ortam örnekleri bulunur. Demo verileri test harness'ine verilmez; aynı frontend build dizinini kullanan tarayıcı testleri sonrası normal API adresiyle build yeniden oluşturulur.
- Teslim notu gerçek endpointleri, veri kalıcılığı ve entegrasyon durumunu, doğrulanan kontrolleri ve kalan kararları belirtir. Kurallar ve gerçek kod çelişirse kodu sessizce farklılaştırmak yerine kararı ve bu belgeyi güncelle.

## Resmi başvuru kaynakları

- [NestJS modülleri](https://docs.nestjs.com/modules), [providers ve DI](https://docs.nestjs.com/providers), [custom providers](https://docs.nestjs.com/fundamentals/custom-providers).
- [MongoDB veri modelleme](https://www.mongodb.com/docs/manual/data-modeling/embedding/), [transaction'lar](https://www.mongodb.com/docs/manual/core/transactions/), [unique indeksler](https://www.mongodb.com/docs/manual/core/index-unique/).
