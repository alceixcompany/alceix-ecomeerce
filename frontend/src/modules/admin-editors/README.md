# Ortak yönetim editörleri

`ProductEditor` ve `ProfileEditor` müşteri ve tedarikçi paneli tarafından `index.ts` sözleşmesinden kullanılır. Modül panel shell'lerine veya iş alanı modüllerine bağımlı değildir. Çağıran modül kayıt, kapsam anahtarı, başlangıç modeli ve B2B minimum adedinin sahibidir.

Ürün editöründe görsel, kapak, açıklama, barkod, fiyat, stok, varyant, SEO, taslak ve kaydedilmemiş değişiklik akışı ortaktır. B2B modu tedarik fiyatı/minimum adet kullanır; perakende veya tedarikçiden tekrar tedarik seçimi açmaz. Profil formu kimlik, sosyal hesaplar, medya, çalışma modu ve SEO önizlemesini paylaşır. Görseller oturumda önizlenir; metin kaydı kapsam bazında doğrulanır.
