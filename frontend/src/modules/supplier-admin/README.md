# Tedarikçi yönetimi

Örnek panel: `/tedarikci/modatekstil/admin` (alternatif örnek: `/tedarikci/firmaadi/admin`). Müşteri mağazası panelinin rotaları ve verileri değiştirilmez. Açık alt sayfalar firma profili, ürün kataloğu, sipariş/kargo, bağlı mağazalar, hakediş, mağaza mesajları, entegrasyon ve destek alanlarını kapsar.

Ticari alıcı yalnızca aktif bağlı Alceix mağazasıdır. Sipariş oluşturma minimum adet, aktif yayın ve stok koşullarını doğrular; tedarik fiyatını sipariş anında kopyalar ve stoğu düşürür. Perakende satış, son kullanıcı ödeme ekranı, mağazanın perakende fiyatını düzenleme veya dış satış kanalı yoktur. Bağlantıyı duraklatmak mevcut siparişleri silmez.

Workspace, tedarikçi kimliğine göre ayrılmış yerel demo verisiyle çalışır. Kayıt sınırında veri doğrulanır. Ürün/fiyat/stok, katalog yayını, sipariş takip bilgisi, firma açıklaması, örnek banka hesabı ve mesajlar yerel olarak saklanır. Gerçek müşteri paneliyle canlı veri paylaşımı, banka aktarımı, gerçek mesaj/destek gönderimi ve stok API çağrısı yapılmaz. API ekranı gizli anahtar kabul etmez. Banka alanında yalnızca örnek veri kullanılmalıdır.

Backend entegrasyonunda rol/tedarikçi sahipliği sunucuda doğrulanmalı; mağaza bağlantısı, stok rezervasyonu ve sipariş idempotency işlemleri tek güvenilir sözleşmede yürütülmelidir. Frontend ve slug gerçek yetki kontrolü değildir. Hakediş, komisyon, vergi, ödeme vadesi ve teslimat otoritesi henüz belirlenmemiştir; panel bunları gerçekmiş gibi hesaplamaz. Yorum alanı bağlı mağazalara ait temsili örnek gösterir; gerçek yorum sağlayıcısı sonraki entegrasyon kapsamıdır.

Müşteri ve tedarikçi panelleri `src/styles/admin-theme.css` üzerinden aynı yerleşim, renk, tipografi, kart, buton ve modal stillerini kullanır. Modülün `supplier-admin.css` dosyası yalnızca B2B tablo, form ve görüşme düzenlerini tamamlar; müşteri panelinden özel bileşen ithal edilmez.

Ürün ekleme/düzenleme ve profil formunun sahibi `admin-editors` modülüdür. Müşteri paneli de aynı dış arayüzü kullanır. Ürün editörü üç aşamalıdır: temel bilgi/görseller, fiyat-stok-varyantlar, katalog/SEO önizlemesi. Tedarikçide fiyat B2B satış fiyatı, maliyet üretim maliyeti olarak yorumlanır ve minimum adet ayrıca doğrulanır. Eski ürün kayıtlarında ayrıntı alanı bulunması zorunlu değildir. Görsel yükleme, açıklama, barkod, varyant ve SEO kaydı yereldir; depolama dolarsa ürün kaydedilmiş gibi gösterilmez.

Sipariş detayının yolu `/tedarikci/<firma>/admin/siparisler/<siparis-id>`: kayıt anındaki fiyat özeti, alıcı mağaza, örnek adres düzenleme, takip kaydı, teslimat, paketleme notu ve CSV dökümü içerir. İptal yalnızca hazırlanan siparişte yapılır ve stok bir kez iade edilir; iptal edilen tutar hakediş hesabından çıkarılır. Gerçek kargo etiketi, fatura veya ödeme üretmez.

Firma profili kimlik, sosyal hesaplar, banner/logo/favicon önizlemesi, çalışma modu ve SEO alanlarından oluşur. Metinler firma kimliğiyle ayrılmış `alceix:supplier:<id>:profile:v1` kaydında saklanır. Görseller yalnızca oturum önizlemesidir. WhatsApp üzerinden doğrudan sipariş alanı tedarikçide gösterilmez; ticari iletişim Alceix mağaza mesajları üzerinden yürür.

Ortak yorum ekranı `/admin/degerlendirmeler` altındadır. `reviews` modülü hem müşteri hem tedarikçi panelinde mağaza, tedarikçi ve influencer profillerini gösterir. Firma yalnızca bağlı aktif mağazayı demo olarak değerlendirebilir. Gerçek ilişki doğrulaması, yorum moderasyonu ve paneller arası veri paylaşımı backend adaptöründe sağlanmalıdır.
