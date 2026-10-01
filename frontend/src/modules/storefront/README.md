# Mağaza vitrini

`/{storeSlug}` sunucuda `server.ts` üzerinden API'den mağaza ve URL filtreleriyle seçilen 24'lü ürün sayfasını okur. Admin ile aynı kayıtlar; bilinmeyen slug 404, API hatasında demo fallback yoktur. `data/stores.ts` yalnız pazarlama sunumlarının örnek verisini ve ekran tiplerini barındırır; canlı route veri kaynağı değildir.

`services/storefront-api.ts` API alanlarını doğrular ve mevcut ekran modeline eşler. Arama/kategori/fiyat/sıralama ve stok filtresi ve numaralı sayfalar server-side katalogdan alınır. Filtre değişince ilk sayfaya dönülür; URL yeniden açıldığında aynı filtre korunur. Arama 300 ms debounce kullanır; SSR ilk batch hydration sırasında yeniden çekilmez. Kart/route yüklemede skeleton, görsellerde shimmer vardır; reduced-motion tercihinde animasyon kapatılır. Ürün detay dialogu mevcut arayüzü korur. Logo/banner/SEO/bio/socials gerçek profilden gelir.

Sepet anonim HttpOnly çerezle mağazaya bağlı MongoDB kaydıdır. Fiyat/toplam/stok her quote'ta sunucudan doğrulanır; çakışan sürüm/hata sonrası yeniden okunur. Stok rezervasyonu, sipariş veya ödeme yoktur. Kapalı/bakım/tatil mağazası ya da yetersiz stok sepete eklemeye izin vermez. Takip giriş gerektirir ve sunucuda kalıcıdır.

Mevcut `/luma-studio` pazarlama bağlantısı o slug DB'de bulunursa çalışır; otomatik örnek mağaza oluşturulmaz. Alıcı hesabı, checkout ve sipariş takibi eksikleri [backend raporunda](../../../../backend/docs/implementation-review.md).
