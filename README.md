# Alceix e-commerce

- `frontend/`: Next.js App Router + React + TypeScript. Mevcut tasarım korunarak gerçek API bağlantıları eklendi.
- `backend/`: NestJS + TypeScript, MongoDB/Mongoose. Modüler monolit; mağaza kapsamı, transaction ve runtime doğrulama.

Kurulum ve test komutları: [backend/README.md](backend/README.md).
Bağlanan ekranlar, kalan iş kuralları ve eksik sayfalar: [backend/docs/implementation-review.md](backend/docs/implementation-review.md).
Kalıcı yerel örnek veriler ve canlı tarayıcı denemesi: [backend/docs/live-demo.md](backend/docs/live-demo.md).
Mimari kararlar: [backend/docs/decisions/001-backend-foundation.md](backend/docs/decisions/001-backend-foundation.md).

Geliştirme kuralları: [frontend/AGENTS.md](frontend/AGENTS.md), [backend/AGENTS.md](backend/AGENTS.md).

Önce MongoDB replica set ve backend'i başlatın; sonra `frontend/` içinde `npm ci`, `.env.example` → `.env.local`, `npm run dev`. Backend 4000, frontend http://localhost:3000. Yeni veritabanında `/kayit-ol` ile kendi mağazanızı oluşturun.
