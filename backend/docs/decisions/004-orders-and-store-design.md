# 004 — Sağlayıcı bağımsız sipariş temeli ve vitrin CMS

Tarih: 2026-10-09. Durum: bu aşamada uygulanan başlangıç sözleşmesi; ödeme/kargo/iade politikası kesinleşince güncellenir.

## Problem

Sipariş ekranları demo kayıtları ve serbest durum geçişleri, vitrin editörü ise yalnız localStorage kullanıyordu. Gerçek katalog stok/fiyat kaynağıyla bağ kurulmadan sipariş veya yayın başarısı gösterilemez.

## Karar

- `orders` ve `design` bağımsız modüllerdir; başka modülün repository'sine erişmez, exported application servislerini kullanırlar.
- Sipariş oluşturma UUID requestId ile aktör + mağaza kapsamında tekrar korumalıdır. İlk girdi değişmez; ürün fiyat/ad/SKU/varyant snapshot'ı sunucudan gelir. Katalog stok hareketleri ve sipariş aynı MongoDB transaction'ında yazılır.
- Şimdilik ödeme yalnız pending, gönderi yalnız preparing/cancelled, rezervasyon held/released. 30 dakikalık rezervasyon ve 60 saniyelik en fazla 100 kayıt kontrolü uygulanır. İptal/süre dolumu stok bırakmayı tekrar etmez. Süre gerçek ödeme oturumu sözleşmesi değildir.
- Kullanılabilir stock ile reservedStock ayrılır; toplam fiziksel stok üst sınırı düzenleme sırasında korunur. Varyant stoğu mevcut isim dizisi modelinden çıkarılamaz; ayrı geliştirme gerekir.
- Kargo/ödeme yokken availability false, ürün toplamı dışında tamamlanmış checkout/fatura gösterilmez. Actor/buyer/request ve dahili not alıcı response'una çıkmaz.
- CMS unique mağaza kaydı ve version CAS kullanır. Draft değişikliği published görünümü etkilemez; yayın açık onay ve doğrulamayla alınan snapshot'tır. Banner mağazanın doğru alanına ait olmalı; mevcut statik başlangıç şablonu ayrıca izinlidir. Public yalnız published döndürür.
- Yayında products görünürdür; mevcut editör düzeni ürün akışını kapatan bir landing page olarak kullanılmaz. Yorum/Instagram/FAQ için olmayan kayıt veya sağlayıcı verisi üretilmez.

## Sonuç

Gerçek manual order ve CMS UI mevcut tasarımla çalışır. Tam ödeme, fulfillment, ledger, partner sahipliği veya alıcı checkout tamamlanmış sayılmaz. Testler geçici gerçek replica set üzerinde transaction, yarış, privacy, CAS ve idempotency kontrol eder. Kalan iş/ölçek/ürün kararları [9 Ekim raporundadır](../implementation-review-2026-10-09.md).
