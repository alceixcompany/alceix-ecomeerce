# Alceix e-commerce

- `frontend/`: Next.js App Router + React + TypeScript. Mevcut tasarım korunarak gerçek API bağlantıları eklendi.
- `backend/`: NestJS + TypeScript, MongoDB/Mongoose. Modüler monolit; mağaza kapsamı, transaction ve runtime doğrulama.

Kurulum ve test komutları: [backend/README.md](backend/README.md).
13 Ekim: gerçek partner/ekip/ortaklık, checkout/ödeme/kargo/iade/finans/para çekme review, B2B, AI/iletişim kuyruğu, referans/yorum/fatura ve platform operasyon backend'leri geliştirildi. Frontend tasarımı korundu; yeni ticari ekranların API bağlantıları ve gerçek sağlayıcı adaptörleri ayrıca tamamlanmalıdır.

Yapılanlar, testler, kurallar, eksik frontend sayfaları ve iş sınırları: [13 Ekim raporu](backend/docs/implementation-review-2026-10-13.md). [API envanteri](backend/docs/api-route-inventory.md), [entegrasyon sözleşmesi](backend/docs/integration-gateway-v1.md).

Önceki geliştirmeler tarihsel olarak [8 Ekim](backend/docs/implementation-review-2026-10-08.md) ve [9 Ekim](backend/docs/implementation-review-2026-10-09.md) raporlarındadır.

Kalıcı yerel örnek veriler ve canlı tarayıcı denemesi: [backend/docs/live-demo.md](backend/docs/live-demo.md).
Mimari kararlar: [backend/docs/decisions/001-backend-foundation.md](backend/docs/decisions/001-backend-foundation.md).

Geliştirme kuralları: [frontend/AGENTS.md](frontend/AGENTS.md), [backend/AGENTS.md](backend/AGENTS.md).

Önce MongoDB replica set ve backend'i başlatın; sonra `frontend/` içinde `npm ci`, `.env.example` → `.env.local`, `npm run dev`. Backend 4000, frontend http://localhost:3000. Yeni veritabanında `/kayit-ol` ile kendi mağazanızı oluşturun.

GitHub teslim kapsamı ve yeniden çalıştırılan kontroller: [13 Ekim teslim notu](docs/releases/2026-10-13.md).
