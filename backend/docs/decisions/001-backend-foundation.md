# 001 — Backend temeli

Durum: uygulandı. Tarih: 2026-10-01.

## Problem ve karar

Mevcut Next.js ekranlarının demo state/localStorage yerine ortak, kalıcı ve mağaza kapsamıyla korunan veriye ihtiyacı var. Kullanıcının kararı MongoDB; frontend görünümü korunacak.

TypeScript + NestJS modüler monolit seçildi. Açık feature modülleri, dependency injection, guard/controller sınırları ekip büyüdükçe sorumlulukları koruyor. Domain saf TypeScript; uygulama servisleri küçük repository/transaction/dosya/e-posta/görsel işleme portları kullanıyor. Mongoose sadece persistence adaptörlerinde. Ayrı mikroservis, Redis veya kuyruk eklenmedi. Tam sürümler lock dosyalarında.

Modülün dışa aktardığı uygulama servisleri diğer modüllerin açık sözleşmesidir; private repository'lere erişilmez. Auth → users/stores, catalog → media, engagement → stores/catalog yönü korunur. Store HTTP API'si çekirdek StoresModule'den ayrı bağlanarak auth döngüsü önlenir.

## Veri ve erişim

- `/api/v1`; Zod strict body/query doğrulaması; yapılandırılmış güvenli hata modeli.
- Opaque HttpOnly/SameSite=Lax oturum; production Secure. DB'de token hash'i ve expiry. Logout ve şifre yenileme oturum iptal eder; TTL silmesinin gecikmesine karşı expiry sorguda da kontrol edilir.
- Mutasyonlar tam frontend Origin kontrolü ister. Next.js same-origin proxy; authenticated SSR cookie forwarding; kullanıcılar arasında response cache paylaşılmaz.
- UUID kalıcı kimlik; slug görünür adres. Kullanıcı kaydı bir mağaza oluşturur; başvuru hesap oluşturmaz. Alıcı kimliği ileride ayrı kullanım senaryosu olacaktır.
- Admin okumalarında ve yazmalarında sahiplik sunucuda çözülür. Başka mağazanın kaydı 404; public response maliyet/SKU/owner/session içermez.
- E-posta normalize/unique, mağaza slug unique, SKU store scoped ve Türkçe case-insensitive unique; kategori normalize/unique.
- Para TRY kuruş tamsayısı. Fiyat/maliyet üst sınırı 9.999.999.999 kuruş. Liste boyutu en fazla 100. Sepet en fazla 100 satır × 99 adet; hesaplar güvenli tamsayı sınırı içinde.
- Kayıt+mağaza+oturum ve kategori+ürün+stok hareketi MongoDB transaction ile atomik. Replica set zorunlu. Stok hareketi koşullu atomik güncelleme; düzenlemede version ile stale write 409.
- Liste sıralaması UUID ile kararlı; public katalog yalnız live. Taslak ayarlar vitrini değiştirmez. Profil yayınlama sürüm kontrollüdür; slug değiştiğinde admin yeni adrese geçer. Eski slug alias/yönlendirmesi bu sürümde yoktur.
- Sepet DB'de anonim çerez hash'i + mağaza kimliğiyle saklanır; her quote güncel ürün, fiyat, stok ve mağaza durumundan hesaplanır. Rezervasyon veya sipariş değildir.

## Medya ve dış işlemler

FileStorage ve ImageProcessor portları disk/Sharp adaptörleriyle bağlanır. PNG/JPEG/WebP içeriği doğrulanır, pixel/frame sınırı uygulanır, metadata temizlenerek WebP üretilir. Profil dosyası 4 MB, ürün dosyası 15 MB; en fazla altı ürün görseli. Metadata DB yazması başarısızsa yeni dosya temizlenir. Başarılı ama kullanılmayan yüklemeleri temizleyen worker henüz yoktur.

SMTP adaptörü tek kullanımlık sıfırlama bağlantısını yollar; teslimat garantili outbox bu sürümde yoktur. Finans ve sağlayıcı iş kuralları uydurulmaz; olmayan servisler explicit unavailable döner/gösterilir. Dropshipping örnek import'u yalnız dört açık şablondan stok=0/taslak ürün yaratır; gerçek tedarikçi bağlantısı değildir.

## Başvuru kaynakları

[NestJS feature modülleri ve export sözleşmesi](https://docs.nestjs.com/modules), [Mongoose transaction yönetimi](https://mongoosejs.com/docs/transactions.html), [MongoDB unique indeksler](https://www.mongodb.com/docs/manual/core/index-unique/).

Frontend proxy ve cookie sözleşmesi: [Next.js 15 rewrites](https://nextjs.org/docs/15/app/api-reference/config/next-config-js/rewrites), [asenkron cookies](https://nextjs.org/docs/15/app/api-reference/functions/cookies). Kurulu Next.js paketi yerel `dist/docs` içermediği için sürüme ait resmi belgeler esas alındı.
