# Design

Mağazaya ait version'lı CMS draft/published snapshot. Public API yalnız published kaydını döndürür; private draft erişimi session + mağaza read, yazma settings-write gerektirir. Body strict/bounded; ilk insert ve sonraki yazmalar CAS + unique storeId ile korunur.

Hero yalnız mağazanın banner medyası, boş değer veya mevcut statik başlangıç şablonudur. Görünür products bölümü yayın için zorunlu; video yalnız geçerli HTTPS YouTube ID. HTML veya dış görsel yayınlanmaz. Mevcut görsel adapter'ı WebP sıkıştırır.

Editör ve public vitrin aynı yayını kullanır; taslak public görünümü değiştirmez. Testimonials boş, koleksiyon/Instagram gallery yüklenen gerçek ürün sayfası, FAQ açıklama/iletişim yönlendirmesidir. İlgili genişletmeler: [9 Ekim raporu](../../../docs/implementation-review-2026-10-09.md).
