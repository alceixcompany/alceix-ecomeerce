# Alceix ana yönetim

`/admin` platform genel bakışı. Alt rotalar: `uyeler`, `magazalar`, `tedarikciler`, `influencerlar`, `satislar`, `is-birlikleri`, `mesajlar`, `islem-gecmisi`. Üye detayları ilgili listenin `[memberSlug]` rotasında, konuşma detayları `mesajlar/[threadId]` rotasında açılır.

Modül mağaza, tedarikçi ve influencer modüllerinin açık `management.ts` sözleşmelerini kullanır. Modüllerin özel UI bileşenlerine erişmez. Ortak ekran sözleşmesi `src/types/management-snapshot.ts` içindedir. Bu adaptörler yalnızca kendi kapsam anahtarlarını, kendi doğrulayıcılarıyla okur. Mevcut panellerin iş kayıtları ana panelden değiştirilmez.

Ana yönetim kayıtları `alceix:platform-admin:demo:v1` içinde tutulur: üye inceleme durumu, demo doğrulama işareti, yönetici notları, görüşme incelemeleri ve gerekçeli işlem geçmişi. İşlem geçmişi son 300 demo kaydını tutar. Durum değiştirme gerçek oturum kapatma, üyelik engelleme veya yetki atama değildir.

Mağaza siparişleri kendi panelinde oturumluk tutulduğundan bu ekranda o modülün örnek siparişleri gösterilir. Tedarikçi siparişleri ve influencer işleri doğrulanmış yerel çalışma alanlarından okunur. Perakende ve B2B brüt tutarlar ayrı raporlanır; ödeme/hakediş olarak sunulmaz. Mağaza ve influencer iş birlikleri ile mesajlar bağımsız demo kayıtlarıdır; çift yönlü otomatik senkronizasyon yapılmaz.

Görüşme içeriği salt okunur. Ana panel, yönetici notunu ilgili taraflara göndermez. CSV dışa aktarımı filtrelenen kayıtları içerir ve formül başlangıçlarını etkisizleştirir.

Bu bir frontend demo yönetim alanıdır. Gerçek ana yönetici oturumu, rol kontrolü, sunucuda kaynak yetkilendirmesi ve değiştirilemez denetim günlüğü bağlı değildir; `noindex` güvenlik mekanizması değildir. Gerçek üye bilgileri ve konuşmalar bağlanmadan önce okuma/yazma servislerinde ana yönetici yetkisi uygulanmalıdır. Bu istekte yeni backend veya kimlik doğrulama servisi kurulmadı.

## Ekip, iletişim, destek ve finans

Yeni rotalar: `/admin/ekip`, `/admin/smtp`, `/admin/sms`, `/admin/eposta`, `/admin/destek`, `/admin/canli-destek`, `/admin/finans`. Operasyon kayıtları `alceix:platform-admin:operations:v1`, demo rol seçimi `alceix:platform-admin:staff-preview:v1` anahtarlarında tutulur. Eski ana yönetim verileri korunur.

Ekipte rol şablonları, özel sayfa listeleri ve görüntüleme/düzenleme ayrımı vardır. Ana yönetici değiştirilemez. Önizleme menü ve sayfa görünümünü kısıtlar; gerçek oturum/ACL değildir, sunucu tarafında yetkilendirme şarttır. Demo önizleme herhangi bir gerçek kullanıcıya erişim vermez.

SMTP ayarları yalnızca gizli olmayan yapılandırmadır; parola/API anahtarı için tarayıcı alanı veya depolama yoktur. SMS/e-posta taslakları, izinli alıcı onayı, önizleme, demo kuyruk ve iptal akışları vardır. DNS, SMTP, SMS, teslim, unsubscribe ve gerçek iletişim izni doğrulaması bağlı değildir. Örnek e-posta adresleri gerçek alıcı olarak sunulmaz.

Destek mağaza ve tedarikçi modüllerinin doğrulanmış açık yönetim sözleşmeleri üzerinden kaynak talepleri okur. Influencer talepleri ve platforma yöneltilen müşteri şikayeti örnek kayıtlardır. Ana panel yanıt/durum/atama katmanı kendi yerel kaydındadır; kaynak paneli değiştirmez ve yanıt iletmez. Canlı destek operatör üstlenme, yerel yanıt, kapatma ve yeniden sıraya alma demosudur; gerçek zamanlı servis yoktur.

Finans kuruş cinsinden hesaplanır. İptal dışı perakende ve B2B hacmi ayrı raporlanır. Alceix kazancı teslim edilmiş, ödenmiş perakende kayıtlarda %3 varsayımıdır; B2B veya influencer komisyonu uydurulmaz. Bekleyen sipariş komisyonu ayrı gösterilir. Aktarımlar bağımsız örnek muhasebe kayıtlarıdır, sipariş dönemine karşı bakiye mutabakatı sayılmaz. Pending → approved → recorded sırası ve kayıt referansı zorunludur; herhangi bir banka işlemi yapılmaz. Ekip, kampanya, destek ve finans değişiklikleri yerel operasyon geçmişine eklenir.

## Değerlendirme, hesap finansı, komisyon ve referans

`/admin/degerlendirmeler`, `/admin/referanslar`, `/admin/finans/[accountId]` eklendi. Hesap ID'si encode edilir ve sunucuda bilinen hesap listesine karşı çözülür. Ekip izinlerine `reviews` / `referrals` eklendi; eski 13 sayfalı ana yönetici kaydı yeni sayfalara güvenli biçimde taşınır, diğer çalışanlara kendiliğinden izin verilmez.

Ticari kayıtlar `alceix:platform-admin:commercial:v1` içinde doğrulanır. Kaynak siparişlere adet ve varsa tarih eklendi. İşlem anlık görüntüsü, ilk görüldüğünde tutar/adet/oran/komisyonu saklar; sonraki özel oran değişiklikleri geçmiş satırları değiştirmez. Yeni görülen satırlar hesaba ait oranla eklenir. İptal kaynak satırları toplamdan çıkarılır, yalnızca tamamlanan influencer işleri finans görünümüne alınır. Geçmiş oranlar %3 mağaza, %0 tedarikçi/influencer demo varsayımıdır; ödeme kaydı bilinmeyen kaynaklar tahakkuk geliri olarak sunulmaz. Hesap detayında brüt hacim, adet veya tamamlanan iş sayısı, kesinti, net tahmin ve bağımsız bakiye kayıtları gösterilir. Bu bir ödeme veya muhasebe mutabakat servisi değildir.

Değerlendirme modülünün açık `management.ts` sözleşmesi her panelin kendi değerlendirme kapsamını okur; yalnızca hesabın aldığı yorumlar dahil edilir. Moderasyon ana panelin yerel katmanıdır, kaynak yorumları silmez/değiştirmez. Yönetim notu ve görünür/inceleme/demo gizli durumları kaydedilir.

Kodlar mağaza/tedarikçi/influencer hesabına aittir. Referans ve kampanya kodu, komisyon geliri üzerinden kazanç payı, kampanya indirimi, tarih aralığı ve aktiflik ayarlanabilir. Kodlu kayıt bağlantısı mevcut kayıt formuna referansı önceden doldurur; gerçek kayıt atfı ve ödeme/indirim servisi yoktur. Demo yönlendirme kayıtları bilinen hesaplardan eklenir, öz yönlendirme ve bir müşteriyi birden fazla aktif referansa bağlamak reddedilir. Kod oranı değişse de mevcut yönlendirmenin kazanç payı korunur. Kazanç kayıt → onay → demo ödeme akışıyla ilerler; gerçek ödeme yapılmaz. Örnek komisyon baz tutarları kendi dönemine ait bağımsız veridir; tüm satışların otomatik referans geliri olduğu iddia edilmez.
