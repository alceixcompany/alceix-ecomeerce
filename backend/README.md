# Alceix backend

NestJS + TypeScript modüler monolit, MongoDB/Mongoose persistence. İş alanları: auth, users, stores, catalog, media, applications, engagement, dashboard. Controller/DTO, kullanım senaryosu/port, domain ve adaptörler ayrı tutulur. Kurallar: [AGENTS.md](AGENTS.md). Kararlar: [001-backend-foundation.md](docs/decisions/001-backend-foundation.md). Kapsam ve eksikler: [implementation-review.md](docs/implementation-review.md).

## Mevcut kapsam ve doğrulama

2026-10-01 itibarıyla kayıt/giriş/çıkış, mağaza sahipliği, profil ve ayar taslakları, ürün/kategori/stok, görsel yükleme, filtre/sıralama/sayfalama, kalıcı sepet/takip, başvuru formları ve katalogdan örnek taslak aktarımı frontend'e bağlıdır. Yönetim ve vitrin aynı MongoDB kayıtlarını kullanır. Görseller WebP olarak kalıcı dosya depolamasında, dosya metadata ve mağaza ilişkileri MongoDB'de tutulur.

24 backend testi ve 4 Playwright testi geçti; lint, typecheck, build ve backend biçim kontrolleri doğrulandı. Playwright kapsamına gerçek CSV dosyası, slug değişikliğinden sonra yeni yönetim adresine yönlendirme ve olmayan gelir verisinin `—` gösterilmesi dahildir. Canlı denemenin adımları, bilinen arayüz sorunu ve eksik ekranlar [live-demo.md](docs/live-demo.md) ve [implementation-review.md](docs/implementation-review.md) içinde kayıtlıdır.

Sipariş/ödeme/kargo/finans, tedarikçi ve influencer yönetim panelleri, başvuru onayı, alıcı hesabı ve SMTP ile şifre yenileme ekranı henüz tamamlanmadı. Başvuru kaydı aktif ortaklık veya panel erişimi oluşturmaz; sepet sipariş değildir. Kaynak koduyla seed komutu ve güvenli örnek ortam dosyaları paylaşılır; yerel `.env`, MongoDB dosyaları, yüklenen medya ve test çıktıları GitHub'a gönderilmez.

## Yerelde çalıştırma

Node.js 20.19+ veya desteklenen güncel LTS, npm ve MongoDB replica set gerekir. Entegrasyon testleri MongoDB 7.0.17 ile çalıştırıldı. Standalone MongoDB başlangıçta reddedilir.

1. MongoDB Atlas replica set bağlantısı veya yerel replica set hazırlayın. Yerel kurulum örneği:

   ```bash
   mkdir -p "$HOME/.local/share/alceix-mongo"
   mongod --dbpath "$HOME/.local/share/alceix-mongo" --bind_ip 127.0.0.1 --port 27017 --replSet rs0
   ```

   Başka terminalde, yeni replica set için yalnızca bir kez:

   ```bash
   mongosh 'mongodb://127.0.0.1:27017/?directConnection=true' --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})'
   ```

   27017 zaten kullanılıyorsa mevcut servisi durdurmayın; boş port seçip bağlantı adreslerini uyarlayın. Bu komutlar yeni yerel geliştirme veritabanı içindir.

2. `backend/` içinde:

   ```bash
   npm ci
   cp .env.example .env
   npm run dev
   ```

   `.env` içindeki `MONGODB_URI` ve `FRONTEND_ORIGIN` değerlerini ortamınıza göre ayarlayın. Origin tam eşleşir; sondaki `/` kabul edilmez.

3. Ayrı terminalde `frontend/` içinde:

   ```bash
   npm ci
   cp .env.example .env.local
   npm run dev
   ```

   `BACKEND_API_URL=http://127.0.0.1:4000`. Next.js `/api/v1` isteklerini backend'e yönlendirir; tarayıcı çerezleri frontend origin'i üzerinden çalışır. API adresi değişirse Next.js'i yeniden başlatın; production build'i yenileyin.

4. http://localhost:3000/kayit-ol üzerinden mağaza oluşturun. Sonra profil/şirket alanını doldurun, mağazayı açın ve görsel/fiyat/stoğu olan bir ürün yayınlayın. Yeni veritabanı boştur; örnek mağaza veya kullanıcı otomatik oluşturulmaz.

Backend: http://127.0.0.1:4000. Geliştirme OpenAPI: http://127.0.0.1:4000/api/docs. Sağlık: `/api/v1/health/live`, `/api/v1/health/ready`. Yazma isteklerinde `Origin: http://localhost:3000` gerekir; korumalı işlemler ayrıca oturum çerezi ister. Swagger arayüzü frontend origin'inden çağrılmadığı için doğrudan backend üzerinde yazmaları reddedilir.

## Kalıcı yerel demo

Örnek veriler uygulama açılırken otomatik eklenmez. Yerel replica set ve `.env` hazırken `backend/` içinde, yalnızca ayrı demo veritabanına:

```bash
MONGODB_URI='mongodb://127.0.0.1:27017/alceix_demo?replicaSet=rs0' npm run db:seed
```

Backend'in `.env` dosyasında da aynı `MONGODB_URI` kullanın. Komut production ortamını, uzak MongoDB bağlantılarını ve `alceix_demo` dışındaki veritabanlarını reddeder. Kayıtları application servislerinden oluşturur; mevcut verileri silmez. Tekrar çalıştırmada SKU'ları bütün sayfalardan okur, yalnız eksik örnek ürünleri ekler; mevcut şifre, mağaza ayarı, ürün fiyatı ve stokları değiştirmez. Aynı demo e-postası başka mağazada kullanılıyorsa ayarları üzerine yazmak yerine hata verir. Aynı anda birden fazla seed çalıştırmayın.

| Hesap | Mağaza | İlk kurulum |
| --- | --- | --- |
| `demo@example.com` | `/luma-studio` | 36 ürün: 32 satışta, 4 taslak |
| `nordik@example.com` | `/nordik-demo` | 8 ürün: 4 satışta, 4 taslak |

Her iki yerel demo hesabının şifresi `AlceixDemo2026!`. Yönetim adresi `/<slug>/admin`. Görseller medya servisi üzerinden yüklenir; farklı kategori, fiyat, stok ve satış modelleri filtre denemesi için hazırdır. Tedarikçi modeli örnek veridir, gerçek bir tedarikçi bağlantısı oluşturmaz.

2026-10-01 canlı denemesinde kalıcı MongoDB dosyaları `backend/var/mongo`, medya `backend/var/media` altında tutuldu. MongoDB şu komutla tekrar başlatılabilir (27017 boşken; bu replica set zaten başlatıldı):

```bash
mongod --replSet rs0 --bind_ip 127.0.0.1 --port 27017 --dbpath "$PWD/var/mongo" --logpath "$PWD/var/mongod.log" --fork
```

Ardından ayrı terminallerde backend'de `npm run build && npm run start`, frontend'de `npm run build && npm run start` kullanılabilir. Mevcut `.env` dosyalarını örnek dosyayla ezmeyin. `var/` ve yerel ortam dosyaları Git dışında kalır. Canlı demo sonuçları: [live-demo.md](docs/live-demo.md).

## Kontroller

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

`npm test` PATH içindeki `mongod` ile geçici dizin, ayrı port ve gerçek tek üyeli replica set açar; test sonunda yalnızca kendi kaynaklarını kaldırır. `MONGOD_BINARY` ile binary yolu verilebilir. Alternatif `ALCEIX_TEST_MONGODB_URI` ayrı bir test replica set'ine işaret edebilir; testler benzersiz veritabanı oluşturup yalnızca onu siler. Production bağlantısı vermeyin.

Tarayıcı testleri `frontend/` içinde:

```bash
npx playwright install chromium
npm run test:e2e
```

Harness aynı MongoDB test altyapısını kullanır; backend 4010, production build ile frontend 3010 açar ve test sonrası kapatır. Bu portlar boş olmalıdır. Ekran görüntüleri ve başarısızlık izleri Git dışında `frontend/test-results/` içindedir.

Tarayıcı harness'i frontend'in `.next` çıktısını yeniden derler. Aynı checkout'ta çalışan `next start` servisini test öncesi kapatın; testten sonra normal `BACKEND_API_URL` ile yeniden build/start yapın. Demo MongoDB'si test harness'ine verilmez. Seed testi her zaman kendi geçici yerel replica set'ini açar; dış test bağlantısına demo verisi eklemez.

## Yayın ortamı

- `NODE_ENV=production`, HTTPS frontend origin'i, private replica set ve kimlik doğrulanan DB bağlantısı gerekir. API loopback üzerinde dinler; reverse proxy/Next.js aynı makineden erişir. Dağıtım topolojisi değişirse listen/bind politikasını açıkça uyarlayın.
- Production'da otomatik indeks oluşturulmaz. İlk kurulum ve şema sürümü yükseltmelerinde `npm run db:indexes` çalıştırın. Bu komut `createIndexes` kullanır, mevcut indeksleri veya kayıtları silmez; benzersizlik ihlalleri önce giderilmelidir. Sonraki veri dönüşümleri ayrı migration olarak sürümlenmelidir.
- `MEDIA_DIRECTORY` kalıcı diske bağlanmalıdır; uygulama klasörünün geçici diski uygun değildir. Çok instance için FileStorage adaptörünün object storage uygulaması gerekir. Medya UUID URL'leri herkese açıktır.
- SMTP opsiyoneldir; ayarsız şifre kurtarma 503 döner. `MAIL_FROM` ve `SMTP_HOST` birlikte gerekir. Şifre yenileme API'si hazır; `/sifre-sifirla` sayfası henüz yoktur.
- Rate limit tek process belleğindedir. Next.js proxy'si arkasında istemciler aynı IP kovasına düşebilir. Çok kullanıcılı yayın öncesi güvenilir proxy üzerinden istemci IP'si ve ortak limiter seçimi yapılmalıdır.
- Ödeme/sipariş/kargo henüz uygulanmadı. Sepet stok ayırmaz; bir alışverişin tamamlandığı anlamına gelmez.

Boyut/sıkıştırma, filtre ve namespace detayları: [002-platform-routes-and-catalogue-performance.md](docs/decisions/002-platform-routes-and-catalogue-performance.md). Dosyalar MongoDB'de binary olarak saklanmaz; `MEDIA_DIRECTORY` içindeki WebP ve DB metadata birlikte yedeklenmelidir.
