# 005 — Ticari süreçler ve sağlayıcı sınırları

Tarih: 2026-10-13. Kullanıcının MongoDB, modüler/SOLID backend ve frontend tasarımını koruma kararları sürdürülür.

## Karar

İş alanları aynı NestJS monolitindedir; typed application port ve repository kullanır. İş alanlarının sahibi tek modüldür. Yeni provider entegrasyonları `GatewayPort` uygulamasıyla değiştirilir. Redis/kuyruk servisi veya mikroservis eklenmeden MongoDB'de job/outbox, atomic lease, retry ve append-only event receipt kullanılır. Repository başka modülün koleksiyonuna erişmez.

Para TRY kuruştur. Finans kayıtları balanced immutable postings; kümülatif exact Decimal128. Komisyon/return/shipping/AI/referral politikaları açıkça atanır ve ticari işlem anında snapshot olur. Resmi sağlayıcı entegrasyonu olmadan paid/delivered/refunded/invoice başarısı üretilmez.

Ödeme, stok rezervasyonu, gönderi, iade, settlement ve payout birbirinden ayrı durumlar taşır. Ücretli ortaklık ve B2B ödemesi real available → escrow → gerçek tamamlanma/hakediş üzerinden yürür. B2B katalog import'u perakende stoğu kopyalamaz. Payout request review durumunda fon tutar, platform finance onayı gerçek dış işi başlatır; sadece provider kanıtı paid yapar.

Merchant ile partner üyeliği ayrı collection/rol/capability modelidir. Davet/süre/kota/CAS yöntemi tutarlıdır; store toplam 50, partner toplam 100 kayıttır. Partner finance rolü okumadır; owner banka/payout/ekip kontrolünü tutar. Ortak destek servisindeki tarihsel storeId alanı scoped UUID olarak partner ticket için de kullanılır; scopeKind ve parent-aware controller store/partner ayrımını korur. Şimdilik eski store ticket'lar için yıkıcı alan migration'ı yapılmaz.

Gateway protokolü projeye aittir; gerçek vendor API'si olduğu söylenmez. Dış mutasyon DB transaction'ında çağrılmaz. Idempotency key durable operation UUID'sidir. Callback ve imzalı pull aynı strict doğrulama ve domain handler'ından geçer. Transport timeout sonucu belirsizdir; terminal provider failure veya confirmed cancellation ile aynı değildir.

Dosya cleanup konservatiftir: yeni unclaimed upload yaş sınırı geçince atomic deleting olarak seçilir. İş kaydında kullanılan dosya retained olur ve otomatik cleanup'a girmez; geçmişi korur. Tam referans sayımı/deletion archive politikası ayrı kapsamdır. Çok instance file depolama için storage portuna object storage adaptörü gerekir.

## Sınırlar

İlk sözleşme TRY/tam perakende iade, tek VAT profile snapshot, açık B2B stok yönetimi, merchant-first-settled-sale referans ödülü ve polling mesaj/destek içerir. Kısmi iade/değişim, otomatik retail ↔ B2B depo eşlemesi, özel social analytics ve influencer fiziksel numune fulfillment ayrı ürün/entegrasyon işi gerektirir. Backend domain temeli hazır diye bu kapsamlar veya frontend panelleri bitmiş sayılmaz.

## Kanıt

[13 Ekim test ve uygulama raporu](../implementation-review-2026-10-13.md), [gateway v1 kontratı](../integration-gateway-v1.md), [API rota envanteri](../api-route-inventory.md). Finans/stock/tenant/idempotency/consent yarışları geçici gerçek replica set testlerinde doğrulanır; local test gateway gerçek sağlayıcı kabul testi yerine geçmez.
