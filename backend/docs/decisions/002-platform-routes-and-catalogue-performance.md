# 002 — Platform adresleri ve katalog performansı

Tarih: 2026-10-01. Kullanıcı modeli: her işletmeci kendi mağazasını açar; ziyaretçi mağaza adresinden kataloğu görür. Mağaza sahibi yalnız kendi yönetim alanına erişir. Tedarikçi ve influencer ayrı profiller ve yönetim yetkileriyle çalışacaktır.

| Alan | Adres | Durum |
| --- | --- | --- |
| Mağaza vitrini | `/{magazaSlug}` | Uygulandı, giriş gerektirmez |
| Mağaza yönetimi | `/{magazaSlug}/admin` | Uygulandı; `/admin/dashboard` aynı genel bakışın takma adresi |
| Tedarikçi listesi | `/tedarikci` | Kararlaştırılan hedef; henüz sayfa/API yok |
| Tedarikçi profili | `/tedarikci/{tedarikciSlug}` | Kararlaştırılan hedef; henüz sayfa/API yok |
| Tedarikçi yönetimi | `/tedarikci/{tedarikciSlug}/admin` | Kararlaştırılan hedef; henüz sayfa/API yok |
| Influencer listesi/profili | `/influencer`, `/influencer/{influencerSlug}` | Kararlaştırılan hedef; henüz sayfa/API yok |
| Influencer yönetimi | `/influencer/{influencerSlug}/admin` | Kararlaştırılan hedef; henüz sayfa/API yok |

`tedarikci` ve `influencer` mağaza slug'ı olarak ayrılamaz; yeni namespace sayfaları yayına alınmadan önce mevcut veride bu eski slug'ların bulunup bulunmadığı denetlenmeli ve gerekiyorsa açık migration/yönlendirme uygulanmalı; route çakışmaları önlenir. Ortak hesap doğrulanmış profile sahip olabilir; yetki URL'den veya başvurunun gönderilmiş olmasından çıkarılmaz. Başvuru → inceleme/onay → ilgili profil ve yönetim yetkisi zinciri ayrı kullanım senaryosudur. Mevcut başvurular halen pending kayıttır, yönetim paneli değildir. Rota tablosu panellerin uygulanmış olduğu anlamına gelmez.

## Uygulanan katalog düzeni

- Public katalog her sayfada 24, admin 6 ürün getirir. API en fazla 100 kayıt kabul eder. Sayfa düğmeleri tüm sayfaları DOM'a dökmek yerine ilk/son ve aktif sayfa çevresinde en fazla 7 düğme gösterir.
- Vitrinde arama/kategori/fiyat/sıralama/stok ve sayfa URL'de tutulur; filtre değişince ilk sayfaya dönülür. SSR aynı filtreli sayfayı getirir; hydration bu ilk isteği tekrar etmez. Metadata ve sayfa aynı request içindeki React cache'i paylaşır; kullanıcılar arasında uygulama cache'i oluşturulmaz.
- Katalog istekleri 300 ms debounce, AbortController ve timeout kullanır. Önceki filtre yanıtı yeni görünümü ezmez. Yüklemede eski filtredeki ürünleri etkileşimli göstermeden aynı kart/tablo ölçülerinde shimmer skeleton kullanılır; reduced-motion tercihinde animasyon durur. Hata boş sonuçla karıştırılmaz ve tekrar deneme vardır.
- Admin ek filtreleri fiyat aralığı, stok durumu ve kendi/tedarikçi ürünü. Backend filtreleri uygulayıp sayfalar. MongoDB facet aggregation toplam/durum/kategori sayaçlarını tek geçişte hesaplar; public sorgu özel alanları persistence sınırında da seçmez. Fiyat/ad sıralaması için indeksler eklendi.
- Sayfalama offset temellidir; çok derin sayfalarda cursor/keyset tasarımı gerekebilir. Ölçülmemiş hız yüzdesi veya sınırsız ölçek iddiası yapılmaz.

## Medya

MongoDB dosyanın UUID, mağaza, kullanım alanı, boyut ve zamanını tutar. WebP dosyaları `MEDIA_DIRECTORY` altında kalıcı disk üzerinden saklanır. Yeni dosyalar Sharp ile yönü düzeltilip metadata çıkarılarak quality=80/effort=4 ile sıkıştırılır. Görsel oranı korunur, küçük resim büyütülmez; en uzun kenar ürün=1600, banner=1920, logo=512, favicon=64 piksel. Farklı türler aynı dosyayı ilişkilendirerek kullanamaz.

UUID dosya adresleri değişmez ve `public, max-age=31536000, immutable` ile servis edilir. Next.js Image ekran genişliğine uygun boyutları üretir; ürün resimleri lazy yüklenir, hero önceliklidir. Resim yüklenirken shimmer, dosya yerleştiğinde normal görünüm korunur. Eski dosyalar otomatik yeniden işlenmez. Çok instance yayın için kalıcı object storage/CDN adaptörü sonraki ortam kararıdır; şu anda bir dış hesap/servis bağlanmadı.

Kaynaklar: [Sharp WebP seçenekleri](https://sharp.pixelplumbing.com/api-output/#webp), [Next.js 15 Image ve sizes/lazy davranışı](https://nextjs.org/docs/15/app/api-reference/components/image), [MongoDB skip ve range pagination](https://www.mongodb.com/docs/manual/reference/method/cursor.skip/).
