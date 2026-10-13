# alceix-gateway-v1

Bu belgedeki HTTP protokolü Alceix'in entegrasyon portudur; bir ödeme/kargo firmasının resmi protokolü değildir. Sağlayıcı seçilince gerçek SDK/HTTP adaptörü bunu uygulayan güvenilir bridge içinde veya aynı portun yeni implementasyonunda yazılmalıdır. Mevcut repo HTTP istemcisini, domain kullanım senaryolarını, durable işleri ve imzalı sonuç tüketimini içerir. Canlı sağlayıcı bağlantısı yapılmadı.

## İstek/yanıt

`POST {COMMERCE_GATEWAY_URL}/v1/{operation}`; `Authorization: Bearer …`, JSON ve `Idempotency-Key`. Mutasyon key'i kalıcı işlem UUID'sidir. Aynı key ve input aynı dış işlemi döndürmeli; farklı input 409 olmalı. Timeout/bağlantı kopması dış işlem başarısızlığının kanıtı değildir. Bridge idempotency kaydını provider çağrısından önce güvenli biçimde yönetmeli ve provider'ın idempotency imkânını kullanmalıdır.

Production URL HTTPS origin; username/password/path/query/fragment yok. Development HTTP yalnız localhost/127.0.0.1/::1. Redirect kabul edilmez. 10 saniye timeout; response akışı 64 KiB ile sınırlı ve strict Zod. Tutar TRY kuruş tamsayısıdır. Response HTTP 200 yalnız dış iş kabulünü gösterir, finansal/delivery başarı değildir.

Tam compile-time payload: [gateway.port.ts](../src/modules/integrations/application/gateway.port.ts). Runtime response: [http-gateway.ts](../src/modules/integrations/infrastructure/http-gateway.ts).

| Operation | Request'in önemli alanları | Response |
| --- | --- | --- |
| payment.create | referenceId, amountCents, TRY, customerEmail, returnUrl | providerReference, HTTPS checkoutUrl |
| payment.refund | referenceId, paymentReference, amountCents, TRY | providerReference |
| payout.create | referenceId, amountCents, TRY, bankReference | providerReference |
| payout.cancel | referenceId | cancelled boolean; true dış işlemin durduğunu garanti eder |
| identity.onboard | referenceId, actorId, scopeId, name, email, returnUrl | providerReference, HTTPS verificationUrl |
| identity.verify | referenceId, actorId, scopeId, owner, iban | verified, bankReference, actorId, scopeId, holderName |
| identity.phone-start | referenceId, phone | providerReference, expiresAt ISO |
| identity.phone-verify | referenceId, challengeReference, phone, code | verified boolean; gerçek süre/deneme/telefon bağını provider kontrol eder |
| shipping.quote | referenceId, shipperScopeId, city, address, sku/quantity items | carrier, amountCents, expiresAt ISO |
| shipping.create | referenceId, shipperScopeId, orderId, carrier, customer, phone, city/address, items | providerReference, tracking, HTTPS labelUrl |
| shipping.cancel | referenceId | cancelled boolean; true fiziksel gönderinin başlamayacağını garanti eder |
| notification.send | referenceId, channel, recipient, subject, message, unsubscribeUrl | providerReference |
| ai.generate | referenceId, owned sourceUrl, prompt, mode, ratio | providerReference |
| ai.cancel | referenceId | cancelled boolean; false iken kredi serbest bırakılmaz |
| invoice.create | referenceId, orderId, amount, seller/buyer/lines snapshot, discount, shipping, pricesIncludeVat | providerReference |
| invoice.credit | referenceId, invoiceReference, amountCents, TRY | providerReference |
| events.pull | referenceId | en fazla 10 adet {payload, timestamp, signature} |

Banka sonucu bridge'in doğrulanmış actor/scope kimliğiyle eşleşir. İstemcinin yazdığı owner adı doğrulama değildir. Bridge gerçek KYC/hesap bağını kurmalı; aynı veya başka scope'a banka referansı uydurmamalıdır. Pickup, fatura hesabı ve vendor credential eşlemesi trusted bridge içinde sunucunun scopeId'siyle çözülür.

## Sonuç kanıtı / webhook

`POST /api/v1/integrations/events`. Browser origin istisnası yalnız bu tam yoldadır; imza zorunludur.

- `X-Alceix-Timestamp`: on haneli Unix saniyesi, en fazla ±300 saniye.
- `X-Alceix-Signature`: küçük harfli 64 hex HMAC-SHA256, farklı WEBHOOK_SECRET ile.
- İmzalanan baytlar: timestamp + `.` + body'nin aynen gönderilen UTF-8 baytları. Yeniden serialize edilerek imza doğrulanmaz.
- Strict body: UUID eventId/referenceId, kind, amountCents, TRY; gerektiğinde providerReference/outputCount/tracking/carrier/labelUrl/invoiceNumber/documentUrl. Alanların türleri [provider-event.schema.ts](../src/modules/commerce/application/provider-event.schema.ts) içinde.
- Aynı eventId aynı normalize edilmiş JSON alan içeriğini temsil eder. Alan sırası değişebilir; farklı payload conflict'tir. Receipt ve domain hareketi aynı transaction'da kalıcılaşır. Olay geldiğinde ilgili iş en az bir kez gerçekten dispatch edilmiş olmalıdır.

Kinds: payment.captured, payment.failed, refund.completed, refund.failed, shipment.shipped, shipment.delivered, payout.completed, payout.failed, notification.sent, notification.failed, ai.completed, ai.failed, invoice.issued, invoice.credit-issued.

```json
{
  "eventId": "b9a84898-b624-47b7-bc20-d1a8bd2a29d2",
  "referenceId": "f36e3cc1-d236-4677-87d8-755745c0ffae",
  "kind": "payment.captured",
  "amountCents": 12500,
  "currency": "TRY",
  "providerReference": "vendor-payment-id"
}
```

Webhook 2xx replay dahil kabul demektir. Timeout/5xx için aynı olay tekrar gönderilir. 409/422 imza/iş kimliği/tutar/durum çelişkisi operasyon incelemesi gerektirir; yeni eventId ile çelişkiyi atlatmaya çalışılmaz. Dış sistem iki gerçekten ayrı tahsilat yaptıysa bridge birini sessizce aynı olay saymamalıdır.

## Webhook kaçması ve uzlaştırma

events.pull cevabı `payload` içinde olayın orijinal JSON metnini taşır; bridge bu metni güncel timestamp ile yeniden imzalar. Alceix aynı HMAC/schema/domain handler'ını kullanır ve sorgulanan referenceId'yi kontrol eder. Yeni olay ID üretmek yerine orijinal eventId korunur; callback ve pull birbirini tekrar ettiğinde tek hareket oluşur. Henüz sonuç yoksa `{ "events": [] }` doğrudur; provider sorgulanmadan başarı üretilmez.

Worker 10 saniyelik döngüde en fazla üç aday seçer; 30 saniyeden eski awaiting/queued veya transport-failed işleri inceler, aday için 60 saniye sonraki kontrol zamanı atomik yazılır. Phone-start jobs sonucu doğrudan challenge cevabıdır, polling adayına alınmaz. Shipment shipped sonucun işini kapatmaz; delivered beklenir. İlk otomatik dispatch bütçesi sekizdir; exhausted lease belirsizliği awaiting olarak korunur. Yetkili manuel transport retry toplam attempts sayısını sıfırlamaz, bütçe bittiyse aynı kimlik için bir ek deneme verir. Orijinal satın alma/iade sahibi merchant üyeliği olmadan kendi değişmez ödeme işini sürdürebilir. Terminal failure generic retry'ye açılmaz. API'de root/finance `POST platform/integration-jobs/:id/reconcile` ve güvenli transport retry slot'ları bulunur. Çok büyük hacimde queue/worker kapasitesi ve provider oran kotaları yük testiyle ayarlanmalıdır.

## AI binary ve teslim sınırları

`GET {gateway}/v1/results/{referenceId}/images/{0..3}` aynı Bearer token ile. Yalnız configured origin'e erişilir; arbitrary URL takip edilmez, redirect reddedilir, toplam 15 MiB ile stream sınırı. Sharp içeriği normalize eder; sonuç metadata'sız WebP ve sahip olunan medya kaydı olur. outputCount 1..4 sağlayıcı olayında belirtilir. Aynı HTTP 200 veya URL AI kredi tüketimi kanıtı değildir.

Gerçek vendor entegrasyon testleri bu belgede tarif edilen test fixture'ının yerine geçmez. Provider cancellation, payout/receipt, mali belge uygunluğu ve delivery replay sözleşmeleri seçilen servisle doğrulanmalıdır.
