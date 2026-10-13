# Kimlik doğrulama

`/giris-yap`, `/kayit-ol`, `/sifremi-unuttum`, `/sifre-sifirla?token=…` ve `/ekip-daveti?token=…` mevcut AuthScreen görünümünü kullanır. API adaptörü Zod doğrular; hatada demo başarı yoktur. Kurtarma gerçek SMTP backend'ini çağırır; ayarsızken 503 gösterir. Reset token sunucuda hash'li, süreli ve tek kullanımlıdır; reset oturumları iptal eder. Token taşıyan sayfalar noindex/no-referrer.

Davet kabulü gerçek hesap e-postasıyla eşleşmelidir; girişsiz kişi girişe gidip doğrulanan davet adresine döner. `next` yalnız oturumdaki mağaza admin yolları, gerçek platform role uygun admin yolları veya tam doğrulanan ekip daveti yoludur; dış adresler kabul edilmez.

E-posta sahipliği doğrulaması ve partner onboarding henüz yoktur. [Güncel rapor](../../../../backend/docs/implementation-review-2026-10-09.md).

Mağaza adı isteğe bağlıdır. Mağazasız kayıt yalnız hesap/oturum oluşturur. Davet login/register linkleri güvenli davet dönüş adresini korur; kabul ayrıca yapılır. Davetsiz mağazasız hesabın bağımsız dashboard/sonradan mağaza açma ekranı henüz yoktur. Referans kodu backend sözleşmesi olmadığından devre dışıdır.
