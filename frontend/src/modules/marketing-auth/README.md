# Hesap sayfaları

`/giris-yap` ve `/kayit-ol` mevcut ortak tasarımı kullanır. `/sifremi-unuttum` aynı tema içinde e-posta doğrulama, istek önizlemesi, adres değiştirme ve girişe dönme akışını sunar. Şifre yenileme bağlantısı gönderilmez ve şifre değiştirilmez; auth backend bağlantısı beklenmektedir. E-posta / şifre / referans kodu loglanmaz ve kalıcı tarayıcı kaydına yazılmaz.

Kayıt ekranında isteğe bağlı 3–32 karakterlik referans kodu bulunur (harf/rakam/tire). Kodun biçimi doğrulanır; gerçek kod geçerliliği, referans sahibinin eşleştirilmesi veya ödül sistemi henüz bağlı değildir. Kayıt şifresi en az sekiz karakter olmalı ve tekrar alanıyla eşleşmelidir. Gerçek oturum veya hesap oluşturulmaz.

Kontrol: `node --test src/modules/marketing-auth/utils/auth-validation.test.mjs`, `npm run lint`, `npm run build`.
