# Frontend geliştirme kuralları

Bu dosya, `frontend/` altında çalışan geliştiriciler ve kodlama araçları için ortak geliştirme rehberidir. Amaç, projeyi farklı geliştiricilerin anlayabileceği, modüler ve sürdürülebilir bir yapıda ilerletmektir.

## 1. Kapsam ve kararlar

- Proje, Next.js App Router, TypeScript, Tailwind CSS ve ESLint kullanır. Sürüm bilgisi için `package.json` ve `package-lock.json` esas alınır.
- Mağaza, yönetim ve tedarikçi gibi alanlar ürünün olası kullanım bağlamlarıdır. Önceki konuşmalarda verilen URL ve sayfa isimleri örnektir; kesin rota haritası veya zorunlu özellik listesi değildir.
- Bu belge geliştirme standartlarını tanımlar; henüz kararlaştırılmamış sayfaları, rolleri, ödeme yöntemlerini veya iş akışlarını ürün gereksinimine dönüştürmez.
- Mevcut yapıyı inceleyerek ilerle. Yeni özelliği kendi kapsamı içinde geliştir; ilgisiz dosyaları yeniden düzenleme.
- Belirsiz ama geri alınabilir teknik seçimleri mevcut örüntülerle çöz. Ürün davranışını veya API sözleşmesini etkileyen belirsizlikleri açıkça kaydet ve netleştir.
- Gelecekte gerekebilir diye boş modüller, kullanılmayan soyutlamalar veya bağımlılıklar oluşturma. Yapıyı gerçek ihtiyaçla büyüt.

## 2. Klasör düzeni ve sorumluluklar

Aşağıdaki yapı bir yerleşim standardıdır. Klasörleri ihtiyaç oluştuğunda ekle; tamamını başlangıçta oluşturmak zorunlu değildir.

```text
src/
  app/                      # Rotalar, layout ve Next.js özel dosyaları
  modules/
    <feature>/              # Tek bir iş alanının sahibi olan modül
      components/           # Yalnızca bu alana ait arayüzler
      screens/              # Rotaların kullandığı ekran bileşimleri
      hooks/                # Bu alana ait React hook'ları
      services/             # Veri erişimi ve API adaptörleri
      schemas/              # Çalışma zamanı doğrulama kuralları
      types/                # Alan modelleri ve sözleşmeler
      utils/                # Bu alana ait saf yardımcılar
      mocks/                # Geliştirme verileri ve mock adaptörleri
      index.ts              # İhtiyaç varsa açık, istemcide güvenli dış arayüz
      server.ts             # İhtiyaç varsa yalnızca sunucuya ait dış arayüz
  components/
    ui/                     # İş alanından bağımsız temel bileşenler
    layout/                 # Tekrar kullanılan yerleşim bileşenleri
  lib/                      # Ortak teknik altyapı: HTTP, formatlama vb.
  config/                   # Rota üretimi, ortam ayarları, uygulama sabitleri
  types/                    # Gerçekten birden fazla alanda ortak tipler
  styles/                   # İhtiyaç oldukça ortak stil ve tema tanımları
```

- `app/` yönlendirme ve ekran birleştirme katmanıdır. `page.tsx` içinde büyük formlar, kapsamlı iş kuralları veya doğrudan HTTP ayrıntıları biriktirme.
- Sayfa; rota girdilerini çözer ve doğrular, ilgili veri erişimini çağırır, modül ekranını oluşturur. `layout.tsx` ortak yerleşim ve uygun provider kapsamını belirler.
- İş alanı kodu kendi modülünde kalır. Tek modülde kullanılan bir bileşeni sırf tekrar kullanılabilir göründüğü için ortak klasöre taşıma.
- Ortak bir kavram için tek sahip belirle. Aynı model, doğrulama veya iş kuralını farklı modüllerde kopyalama.
- `lib/`, `types/` ve `utils/` klasörlerini ilgisiz kodların toplandığı depolara dönüştürme; dosya adı amacını açıkça anlatmalı.
- Testleri ilgili dosyanın yanında, uçtan uca senaryoları gerektiğinde `frontend/e2e/` içinde tut.

## 3. Modüller arası bağımlılıklar

- Genel bağımlılık yönü: `app → modules → ortak components/lib/config/types`.
- Ortak altyapı ve temel UI bileşenleri iş modüllerine veya `app/` dosyalarına bağımlı olmamalıdır.
- Modüller birbirlerinin özel bileşenlerine ve iç klasörlerine doğrudan erişmemelidir. Gerekli paylaşımı açıkça dışa aktarılan bir sözleşmeyle yap.
- İki modülü birlikte kullanan bir ekranı mümkün olduğunda rota katmanında birleştir. Modüller arası bağımlılık gerekiyorsa tek yönlü ve açık tut; döngü oluşturma.
- Her klasöre otomatik `index.ts` ekleme. Kullanıldığında yalnızca gereken dışa aktarımları yaz; sunucu kodunu istemcinin eriştiği ortak export zincirine dahil etme.
- Büyük dosyaları sorumluluklarına göre böl. Sabit satır sınırı uğruna anlaşılması zor küçük dosyalar üretme.

## 4. Adlandırma ve TypeScript

- Kod, dosya ve değişken adlarında tutarlı İngilizce kullan. Kullanıcıya gösterilen metinlerin dili ürün kararına bağlıdır.
- Normal dosya ve klasörler `kebab-case`, React bileşenleri ve tipler `PascalCase`, fonksiyon ve değişkenler `camelCase` olmalıdır. Next.js özel dosya adları ve rota söz dizimi korunur.
- Hook adları `use` ile başlar. Boolean isimleri durumu anlatır: `isLoading`, `hasPermission`, `canSubmit`.
- `data`, `item`, `manager`, `helper` gibi belirsiz adlar yerine bağlamı anlatan isimler kullan. Kısaltmaları yalnızca yaygın ve anlaşılırsa tercih et.
- Yeni uygulama kodunda TypeScript ve mevcut `strict` ayarlarını kullan. Hataları susturmak için `any`, gereksiz type assertion veya genel `@ts-ignore` ekleme.
- Dış kaynaklardan gelen veriyi `unknown` olarak ele alıp sınırda doğrula. TypeScript tipi, çalışma zamanı doğrulamasının yerine geçmez.
- API veri tipi ile ekran modelinin ihtiyaçları farklıysa eşlemeyi servis/adaptör katmanında yap.
- Durumları anlamlı union türleriyle modelle; birbiriyle çelişebilen çok sayıda boolean kullanma.
- Modüller arası importlarda `@/` alias'ını, aynı modül içinde kısa ve anlaşılır göreli yolları kullan. Tip importlarında `import type` tercih et.

## 5. Rotalar, slug ve alt sayfalar

- URL yapısını özellik gereksinimi belirlendiğinde tasarla. Bu belgedeki hiçbir örneği zorunlu sayfa olarak uygulama.
- Dinamik segmentlere `[slug]` yerine anlamı açıksa `[storeSlug]`, `[productSlug]` gibi bağlam belirten adlar ver. Aynı segment için tutarlı isim kullan.
- Route group'ların URL'ye segment eklemediğini dikkate al; farklı gruplardan aynı URL'yi üreten çakışan sayfalar oluşturma.
- Farklı kullanıcı deneyimlerine sahip alanların yerleşimlerini ayır. Vitrin başlığı, yönetim menüsü veya alana özel provider tüm uygulamaya yanlışlıkla taşınmamalıdır.
- Catch-all rotaları yalnızca gerçekten değişken derinlik gerektiğinde kullan. Açık alt sayfaları tek bir slug sayfasında büyük koşul bloklarıyla yönetme.
- Rota oluşturma fonksiyonlarını `config/routes.ts` gibi tek bir kaynakta tut. Link, breadcrumb, yönlendirme ve menülerde URL metinlerini tekrar tekrar birleştirme.
- Dinamik URL parçalarını güvenli biçimde encode et. Query parametrelerini `URLSearchParams` veya aynı işi yapan ortak yardımcıyla oluştur.
- Slug; kalıcı kimlik veya yetki kanıtı değildir. Kaydı çözümledikten sonra işlemlerde kararlı kimliği kullan.
- Slug biçimi, benzersizlik kapsamı, ayrılmış kelimeler ve yeniden adlandırma davranışı backend sözleşmesiyle birlikte belirlenir. Kesinleştiğinde tek bir doğrulama kaynağında uygula.
- Bilinmeyen kayıt, geçersiz parametre ve erişim reddini ayırt et. Gizli kaydın varlığını açıklamamak gereken durumlarda ürünün erişim politikasını uygula.
- Arama, filtre, sıralama ve sayfalama gibi paylaşılabilir durumları URL'de tut. Değerleri doğrula; geçersiz değerler için tutarlı varsayılan veya hata davranışı belirle.
- Next.js sürümünün asenkron `params` ve `searchParams` sözleşmelerine uy. API kullanımını kurulu sürümün dokümantasyonuyla doğrula.
- Yeni rota eklerken uygun `loading`, `error`, `not-found` ve metadata davranışını değerlendir; aynı sınırın kapsadığı alt sayfalara gereksiz dosya kopyalama.

## 6. Sunucu, istemci ve durum yönetimi

- Server Component varsayılanını koru. Etkileşim, tarayıcı API'si veya istemci hook'u gerektiren en küçük uygun bileşene `"use client"` ekle.
- Bir alt bileşen etkileşimli diye bütün sayfayı veya kök layout'u istemci bileşenine dönüştürme.
- Gizli anahtar, ayrıcalıklı servis ve sunucuya özel kod istemci paketine girmemelidir. Uygun modüllerde `server-only` sınırı kullan.
- Yerel arayüz durumunu yerel state'te; paylaşılabilir gezinme durumunu URL'de; uzak veriyi veri erişimi/cache katmanında tut.
- Context veya ek state kütüphanesini yalnızca birden fazla bileşenin gerçek ortak ihtiyacı olduğunda ekle. Türetilen değerleri gereksiz ikinci state olarak saklama.
- Provider'ları ihtiyaç duyulan en dar layout veya bileşen seviyesine yerleştir.
- Kullanıcı, mağaza veya benzer çalışma bağlamı değiştiğinde ilgili cache, geçici state ve kalıcı depolamanın nasıl ayrılacağını belirle. Başka bağlamın verisi yeni ekranda görünmemelidir.
- Çoklu mağaza/kullanıcı desteği uygulandığında cache ve depolama anahtarlarına ilgili kapsam kimliğini dahil et. Bağlamı doğrulamadan yalnızca URL'den güvenilir kabul etme.
- SSR sırasında `window` veya `localStorage` kullanma. Tarayıcıya özgü okuma ve kalıcılığı hydration uyumlu şekilde ele al.

## 7. Veri erişimi ve backend'e hazırlık

- UI bileşenleri API adreslerini, token işlemlerini veya tekrar eden `fetch` ayrıntılarını bilmemelidir. Veri erişimi ilgili modülün servisinden geçmelidir.
- HTTP istemcisi gibi ortak altyapı `lib/` içinde; endpoint ve iş alanı eşlemeleri ilgili modülde bulunmalıdır.
- Listeleme sözleşmelerinde filtre, sıralama ve sayfalama ihtiyacını değerlendir. Ekranda bütün verinin tek istekte geleceğini varsayma.
- Hataları ortak bir yapıya dönüştür: hata kodu, güvenli kullanıcı mesajı ve varsa alan hataları. Ham sunucu hatasını kullanıcıya gösterme.
- İptal edilen istekleri ve eski yanıtların yeni durumu ezmesini ele al. Yazma işlemlerinde körlemesine tekrar deneme yapma.
- Veri önbellekleme, tazelik ve güncelleme sonrası geçersizleştirme davranışını açıkça seç. Kişisel veya yönetim verisini kullanıcılar arasında ortak cache'e koyma.
- Backend hazır değilse tipli mock verileri modülün `mocks/` alanında tut. Bileşenin içine büyük örnek veri dizileri yerleştirme.
- Mock ve gerçek veri adaptörleri aynı servis sözleşmesini sağlamalıdır. Geçiş, ekranların yeniden yazılmasını gerektirmemelidir.
- Mock kullanımını açık bir yapılandırmayla seç; API hatası aldığında sessizce mock başarıya geçme. Demo davranışını gerçek entegrasyon tamamlanmış gibi sunma.
- Eş zamanlı sunucu isteklerinin paylaştığı değişkenlerde kullanıcıya özel mock durum saklama. Mock kimlik doğrulamayı gerçek erişim güvenliği kabul etme.
- Backend henüz belirlenmediyse sözleşme varsayımlarını ilgili özellik notunda belirt. Frontend görevi içinde talep edilmemiş backend veya veritabanı mimarisi kurma.

## 8. Yapılandırma ve değişkenler

- API adresi ve ortama göre değişen değerleri bileşenlere sabitleme. Ortam ayarlarını merkezi, doğrulanan bir config katmanından oku.
- `NEXT_PUBLIC_` önekli değişkenlerin kullanıcıya açık olduğunu kabul et; bu alana secret ekleme. Sunucu ve istemci yapılandırmalarını ayır.
- Yeni ortam değişkenlerini açıklama ve güvenli örnek değerle `.env.example` içinde belgele. Bu dosyanın Git tarafından yanlışlıkla ignore edilmediğini kontrol et; gerçek `.env` ve secret dosyalarını commit etme.
- Her ayarı ortam değişkenine dönüştürme. Ortam ayarı, ürün yapılandırması, kullanıcı tercihi ve mağazaya özgü ayarın sorumluluklarını ayır.
- Sabitleri anlamlı kapsamda tut. Para birimi, dil, saat dilimi, sayfa boyutu ve dosya sınırları gibi değişebilecek değerleri ilgili tek kaynaktan yönet.
- Özellik bayrakları erişim yetkisi değildir. Yetki kontrolünü feature flag veya görünürlük koşuluna bağlama.
- Başlangıçta desteklenmeyen özellik için sahte seçenek üretme; yeni varyasyon gerektiğinde mevcut sözleşmeyi açıkça genişlet.

## 9. E-ticaret verisi ve erişim sınırları

Bu maddeler ilgili özellik geliştirildiğinde uygulanır; özelliklerin tamamının yapılması gerektiği anlamına gelmez.

- Parayı yalnızca kayan noktalı sayı olarak modelleme. Backend sözleşmesine göre küçük para biriminde tamsayı veya kesin ondalık gösterim ve para birimi kodu kullan; biçimlendirmeyi `Intl` ile merkezileştir.
- Tarih/saat aktarımında saat dilimi anlamını açık tut. Tarih-only değerlerle zaman damgalarını karıştırma; kullanıcıya gösterimi seçilen locale ve saat dilimine göre yap.
- Fiyat, indirim, vergi, kargo, stok ve ödeme sonucu için gerçek sistemin otoritesi backend'dir. Frontend hesabı veya URL parametresi işlemin başarılı olduğunu kanıtlamaz.
- Ürün varyasyonu varsa seçili varyasyonun kimliği, stok ve fiyatını ayrı ele al. Ekran açıkken fiyat veya stok değişmesini hata/yenileme akışıyla karşıla.
- Sipariş, ödeme ve teslimat gibi bağımsız süreçleri tek bir belirsiz `status` alanına sıkıştırma. Gerçekte desteklenen durum ve geçişleri sözleşmeye göre modelle.
- Kullanıcı rolü, kaynak sahipliği ve işlem yetkisini ayırt et. Menü veya buton gizlemek erişim kontrolünün yerine geçmez.
- Yetkiyi veri okuma ve yazma sınırlarında doğrula. Layout veya proxy yönlendirmesine tek başına güvenme; Server Action ve Route Handler kullanılıyorsa onların erişimi de korunmalıdır.
- Girişe yönlendirme, oturum süresinin dolması ve erişim reddi için tutarlı davranış belirle. Dönüş adreslerini doğrula; dış adrese kontrolsüz yönlendirme yapma.
- URL, log ve tarayıcı depolamasına gereksiz kişisel veri veya hassas ödeme bilgisi koyma. Kullanıcı içeriğini güvenli işle; denetlenmemiş HTML render etme.

## 10. Arayüz, formlar ve erişilebilirlik

- Önce mevcut bileşen ve tasarım token'larını kullan. Renk, boşluk, tipografi ve köşe değerlerinin tekrarını merkezi tema üzerinden yönet.
- `globals.css` temel stiller ve tema içindir; sayfaya özel stilleri global seçicilerle yayma. Dinamik temaları kontrollü CSS değişkenleriyle uygula.
- Tasarımı mobile-first geliştir. Uzun metin, eksik görsel, boş liste, çok kayıt ve dar ekran durumlarını değerlendir.
- Veri kullanan ekranlarda yükleniyor, boş, hata ve başarılı durumlarını tasarla. Gerektiğinde erişim reddi, çevrimdışı bağlantı ve yeniden deneme durumlarını ekle.
- Formlarda görünür label, alan bazlı hata, gönderim durumu ve başarı geri bildirimi bulunmalıdır. Hata sonrası kullanıcının girdilerini gereksiz yere sıfırlama.
- Bekleyen gönderimde tekrar tıklamayı engelle; işlemin sonucu kesinleşmeden başarı gösterme. İyimser güncelleme kullanılırsa hata halinde geri alma davranışı bulunmalıdır.
- Silme veya geri alınamayan kullanıcı işlemlerinde uygun onay/geri alma deneyimi tasarla. Kaydedilmemiş düzenlemelerin yanlışlıkla kaybolmasını ilgili akışta değerlendir.
- Semantik HTML, klavye erişimi, görünür odak, yeterli kontrast ve anlamlı alternatif metin kullan. Tıklanabilir `div` yerine uygun `button` veya link tercih et.
- Modal ve menülerde odak yönetimi, Escape davranışı ve erişilebilir isimleri ele al. Durumu yalnızca renk ile anlatma.
- Kullanıcıya teknik hata ayrıntıları gösterme. Tekrarlanan metin ve formatları tutarlı tut; çok dil desteği istenirse eklenmesini zorlaştıracak dağınık metin birleştirmelerinden kaçın.

## 11. Performans ve bulunabilirlik

- Gereksiz istemci JavaScript'i ve tekrar eden istekleri azalt. Büyük editör, grafik veya benzer bağımlılıkları yalnızca ihtiyaç duyulan alana yükle.
- Görsellerde uygun boyut, en-boy oranı ve yükleme davranışı kullan; Next.js Image kullanıldığında uzak kaynak izinlerini açıkça tanımla.
- Büyük listelerde sayfalama veya gerektiğinde sanallaştırma kullan. Ölçülmüş ihtiyaç olmadan karmaşık optimizasyon ekleme.
- Herkese açık sayfalarda uygun başlık, açıklama ve gerekiyorsa canonical/OG verilerini sağla. Özel alanlarda indekslenmeme davranışını belirle; `noindex` veya `robots.txt` dosyasını güvenlik önlemi sayma.
- Arama ve filtre URL'lerinin indekslenmesi ile slug değişikliklerinin yönlendirmelerini ilgili özellik geliştirilirken kararlaştır.

## 12. Geliştirme, kontrol ve devir teslim

- Paket yöneticisi npm'dir. `package-lock.json` dosyasını güncel tut; ikinci bir paket yöneticisinin lock dosyasını ekleme.
- Yeni bağımlılığı yalnızca somut ihtiyaç için ekle; mevcut çözümü, bakım durumunu, paket boyutunu ve sunucu/istemci uyumunu değerlendir.
- Bir özelliğe başlamadan önce rota, modül sahibi, veri sözleşmesi, erişim kapsamı ve ekran durumlarını belirle. Küçük işler için gereksiz tasarım belgesi üretme.
- Anlamlı iş kuralları, rota üretimi, doğrulama, kapsam izolasyonu ve kritik kullanıcı akışları için uygun testleri ekle. Sadece uygulama ayrıntısını tekrar eden veya basit metin değişikliğini test eden testler yazma.
- Çalıştırılabilir kod değişikliklerinden sonra `frontend/` içinde `npm run lint` ve `npm run build` çalıştır; varsa ilgili testleri de çalıştır. Yalnızca dokümantasyon değişikliğinde bağlantı, örnek ve tutarlılık kontrolü yeterlidir.
- Arayüz değişikliğini ilgili ekran boyutlarında ve temel klavye akışında kontrol et. Çalıştıramadığın kontrolleri tamamlanmış gibi raporlama.
- Özellik tamamlanınca kullanılmayan dosya/importları temizle; geçici debug kodu, hassas log veya açıklamasız TODO bırakma.
- Teslim notunda neyin değiştiğini, nasıl doğrulandığını, mock/gerçek entegrasyon durumunu ve kalan ürün kararlarını belirt.
- Önemli mimari kararları ihtiyaç oldukça `docs/decisions/` altında kısa karar notlarıyla kaydet: problem, karar, gerekçe, sonuç. Modülün özel davranışı varsa yanında kısa README tut.
- Standart değişirse bu dosyayı güncelle. Çelişen ikinci bir genel kural belgesi oluşturma; README ve araçlara özel talimatlar bu dosyaya yönlendirsin.

## Next.js başvuru kaynakları

Kurulu sürümün `node_modules/next/dist/docs/` belgelerini esas al. Rota düzeni için [proje yapısı](https://nextjs.org/docs/app/getting-started/project-structure), parametre kullanımı için [dinamik segmentler](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes), erişim sınırları için [kimlik doğrulama rehberi](https://nextjs.org/docs/app/guides/authentication) başvuru kaynaklarıdır. Aşağıdaki otomatik Next.js bloğunu koru.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
