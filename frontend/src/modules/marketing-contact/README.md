# İletişim

`/iletisim` herkese açık iletişim ekranıdır. Sayfa sunucuda render edilir; yalnızca form istemci bileşenidir. Form alan doğrulaması yapar, ilk hataya odaklanır ve kullanıcı girdilerini korur. Hazırlanan taslak `mailto:` ile kullanıcının e-posta uygulamasına aktarılır; otomatik gönderim veya backend talep kaydı yoktur. Kişisel veriler tarayıcı depolamasına yazılmaz.

Kanal, çalışma saati ve adres bilgileri `config/contact.ts` içindedir. Adres mevcut footer bilgisine dayanır; yayın öncesi kurumsal iletişim bilgileri teyit edilmelidir. WhatsApp numarası tanımlı olmadığı için canlı bağlantı yerine destek formuna yönlendirilir. Bölge haritası temsilidir; Google Maps tam adres araması dış bağlantıyla açılır. S.S.S. bölümü yerel details/summary kullanır.
