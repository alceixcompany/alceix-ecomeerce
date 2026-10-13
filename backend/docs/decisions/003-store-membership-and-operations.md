# 003 — Mağaza üyeliği, gerçek operasyon kayıtları ve platform sınırı

Tarih: 2026-10-08. Durum: uygulandı.

## Problem

Yeni yönetim ekranları profil, müşteri, destek, ekip ve platform kayıtlarını mock/localStorage'dan okuyordu. Ekip daveti gerçek kimlik/erişim vermiyordu. Örnek slug kontrolü gerçek yeni mağazaların bazı ekranlarını kapatıyor; partner ve platform admin adresleri gerçek sunucu yetkisi olmadan açılıyordu.

## Karar

- MongoDB ve NestJS modüler monolit korunur. CRM/support/contact kendi bounded domain'leridir. Ekip üyeliği mağaza yetkisinin sahibi `stores` modülündedir; mevcut owner ilişkisi korunur.
- Mağaza yetkisi owner veya aktif `(storeId,userId)` üyeliği + açık capability üzerinden doğrulanır. `owned` varsayılanı owner-only kalır. Editör/destek/görüntüleyici birbirinden ayrıdır. İstemci sahibini/platform rolünü atayamaz.
- Davet 7 günlük hash'li tek kullanımlık token'dır; e-posta hesabı eşleşmesi gerekir. Üye sayısı transaction'lı kota ile owner dahil 50'dir. Başvuru veya davet kendiliğinden platform/partner yetkisi değildir.
- Platform görevlisi rolü DB'de ve yalnız sunucu CLI ile atanır. Platform destek yalnız merchant `platform` kanalını yönetir; mağazanın `customer` kanalı ve ekip üyelerinin özel taslakları bu yetkiyle açılmaz. Özel dosya ancak talebe bağlanmışsa platformdan indirilebilir.
- Partner sahipliği/onboarding kurulana kadar tedarikçi/creator panelleri platform görevlisine açık demo önizlemedir. Bu geçici kısıt gerçek partner RBAC yerine geçmez; ürünleştirme için ayrı onay/profil/üyelik modeli gerekir.
- Kişisel profil, CRM, ekip, destek ve iletişim gerçek API kullanır. API hatası mock başarıya dönüşmez. CRM kampanya/e-posta kayıtları yalnız draft'tır; teslim, sadakat otomasyonu veya sipariş metrikleri üretilmez.
- Güncellemeler version CAS kullanır. İletişim create ve destek replies UUID idempotency ile korunur. Destek taslağı user/store/ticket kapsamlıdır; gönderilen yanıtla eşleşiyorsa aynı transaction içinde temizlenir, sürüm sıfırlanmaz.
- Destek eki public ürün medyasından ayrıdır. Binary özel file storage'da, metadata DB'de; PNG/JPG/WebP normalize, PDF/TXT sınırlı doğrulanır; authenticated attachment indirmesi uygulanır.

## Sonuç ve sınırlar

Modüller framework/persistence ayrımını korur, frontend tasarımı korunarak API adaptörleri değişir. Gerçek veri aynı mağaza/platform destek kaydından okunur; demo finans/partner/AI kayıtları gerçek sonuç olarak taşınmaz. Partner approval, checkout/ödeme/kargo, ledger, teslim outbox'ı, CMS publish ve gerçek yorum ilişkisi ayrı sonraki aşamalardır. [Uygulama raporu](../implementation-review-2026-10-08.md) endpointleri, yetki tablosunu ve tüm eksikleri içerir.

9 Ekim ek kapsam: `orders-read` sahip/editör/destek/görüntüleyici, `orders-write` sahip/editör. CMS yazma mevcut settings-write kullanır; mağazasız kayıt üyelik veya partner sahipliği oluşturmaz. [Sipariş/CMS kararı](004-orders-and-store-design.md).
