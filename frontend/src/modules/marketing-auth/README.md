# Hesap sayfaları

`/giris-yap` ve `/kayit-ol` mevcut AuthScreen/AuthForm görünümünü paylaşır. `services/auth-api.ts` kayıt/giriş/me/çıkış/kurtarma endpointlerini Zod ile doğrular; paylaşılacak istemci sözleşmesi `index.ts` üzerinden export edilir. Formlar pending durumunda tekrar gönderimi engeller ve gerçek kalıcı sonuçtan sonra kullanıcıya ait mağazanın admin sayfasına gider. `next` yalnız oturumdaki mağaza yönetim rotaları için kabul edilir.

Şifre/token tarayıcı depolamasına yazılmaz; HttpOnly session çerezini backend verir. Registration mevcut form gereği satıcı ve mağaza oluşturur; ayrı alıcı kaydı henüz yoktur.

Şifremi unuttum mevcut e-posta alanıyla kurtarma isteği gönderir. SMTP ayarsızsa açık servis hatası gösterir. Reset API'si hazır; bağlantıyı işleyen `/sifre-sifirla` sayfası henüz yoktur. Ayrıntılar [backend raporunda](../../../../backend/docs/implementation-review.md).

Kayıt formuna isteğe bağlı referans kodu ve `?ref=` önceden doldurma eklendi. Bu alan biçim doğrulamasıdır; sunucu referans atfı/ödül işlemi henüz bağlı değildir. Ayrı `/sifremi-unuttum` ekranı demo önizlemedir; giriş formundaki gerçek API kurtarma isteği korunur.
