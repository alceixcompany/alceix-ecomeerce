# Frontend

8 Ekim: kişisel profil, CRM/taslaklar, mağaza ekibi/RBAC, özel dosyalı destek, platform destek ve iletişim formu gerçek API'ye bağlı. Diğer ticari demo alanları ve 92 rotanın durumu [önceki envanterde](../backend/docs/implementation-review-2026-10-08.md). Frontend tedarikçi/influencer admin hâlâ geçici platform demo kapısını kullanır. Gerçek partner sahipliği/onboarding/ekip/ticaret backend'i 13 Ekim'de eklendi; panel adaptörleri ve rol kapısı henüz bağlanmadı.

## Tedarikçi yönetimi

Panel: `/tedarikci/modatekstil/admin` (diğer firma slug'ları da desteklenir).

- `/urunler`: B2B katalog, ürün ekleme/düzenleme, yayın durumu, stok, arama, filtre, sıralama, sayfalama ve CSV dışa aktarma.
- `/finans`: hakediş özeti, işlem filtreleri, IBAN düzenleme, örnek aktarım tercihi ve komisyon simülatörü.
- `/siparisler`: yalnızca bağlı aktif Alceix mağazalarına sipariş oluşturma, minimum adet/stok kontrolü, sipariş ayrıntısı, kargo takibi ve paketleme listesi.
- `/studyo`: model/sahne ayarları, dört örnek görsel varyasyonu, galeri, indirme ve katalog kapak görseli seçimi.
- `/mesajlar`: bağlı mağazalarla yerel sohbet; harici bağlantı, e-posta ve telefon paylaşımı engellenir.
- `/ekip`: davet taslağı, görev seçimi, rol düzenleme ve ekip kaydını duraklatma.
- `/destek`: talep oluşturma, arama, durum filtresi, yanıt, kapatma ve yeniden açma.

Veriler firma bazında tarayıcıda saklanır. Ek araçların kaydı `alceix:supplier:<firma-id>:tools:v1` anahtarında doğrulanarak yüklenir. Bunlar demo akışlarıdır: gerçek AI üretimi, ödeme/IBAN aktarımı, kargo entegrasyonu, e-posta daveti, sunucu mesajlaşması ve firmanın gerçek hesap/üyelik sahipliği bağlı değildir. AI stüdyo mevcut örnek görselleri kullanır; krediler örnek sayaçtır. Siparişler son tüketiciye satış açmaz.

Doğrulama: `node --test src/modules/supplier-admin/utils/*.test.mjs`, `npm run lint`, `npm run build`.

Geliştirmeye başlamadan önce [frontend geliştirme kurallarını](./AGENTS.md) okuyun. Modül yapısı, rota düzeni, veri erişimi ve devir teslim standartları bu dosyada tanımlıdır.

## Kurulum ve doğrulama

Önce MongoDB replica set ve backend'i [backend README](../backend/README.md) üzerinden hazırlayın. `frontend/` içinde `npm ci`, yeni ortamda `.env.example` → `.env.local`, ardından `npm run dev`. Var olan `.env.local` dosyasını ezmeyin. Normal backend adresi `http://127.0.0.1:4000`; tarayıcı istekleri aynı origin `/api/v1` proxy üzerinden gider.

```bash
npm run lint
npm run build
node --test $(rg --files src -g '*.test.mjs')
npm run test:e2e
```

Playwright geçici backend 4010 / production frontend 3010 ve izole MongoDB replica set açar; test sonunda kapatır. Aynı `.next` dizini kullanıldığı için mevcut `next start` test öncesi kapalı olmalıdır. Sonrasında normal API ayarıyla `npm run build` tekrar çalıştırın. Kişisel veri/medya ve test çıktıları Git dışında kalır.

Tüm geliştirme kuralları [AGENTS.md](AGENTS.md) içinde; kurulu paket sürümleri `package.json` ve lock dosyasıyla belirlenir.

9 Ekim: gerçek sipariş liste/detay/manüel oluşturma/adres/not/iptal, dashboard sipariş sayıları ve sunucuda CMS taslak/yayın bağlandı. Ödeme bekler; sağlayıcı bağlı değildir. Önizleme gerçek katalog kullanır; sipariş oluşturmaz. Kapsam ve eksikler: [güncel rapor](../backend/docs/implementation-review-2026-10-09.md).

## 13 Ekim backend teslimi

[Backend raporu](../backend/docs/implementation-review-2026-10-13.md) her ekranın API eşlemesini ve eksik checkout/alıcı sipariş/dönüş/doğrulama/partner davet sayfalarını içerir. Yeni backend'ler [rota envanterinde](../backend/docs/api-route-inventory.md). Bu aşamada mevcut görseller/CSS değiştirilmedi; burada anlatılan demo araçlar gerçek ödeme/AI/gönderim başarıları sayılmaz. Provider HTTP bridge sözleşmesi vardır, gerçek vendor adaptörleri yoktur.
