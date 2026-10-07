# Influencer çalışma alanı

Rota: `/influencer/[creatorSlug]/admin`; örnek hesaplar `melis`, `caner`, `zeynep`, `burak`.

Müşteri ve tedarikçi panellerinin ortak admin temasını kullanır. Genel bakış, gelen/gönderilen teklifler, teklif detayları, tamamlanan işler, ürün gönderileri, profil/portföy editörü, portföy önizlemesi, firma mesajları ve ortak yorum ekranı içerir.

İş birliği durum makinesi gelen teklif kabulü/reddi, gönderilen teklif geri çekme, içerik teslimi ve açıkça etiketlenen demo marka onayını sınırlar. Kabul edilen ürünlü iş hazırlık kuyruğuna girer. Sosyal içerik teslimlerinde yalnızca HTTPS sosyal platform bağlantıları kabul edilir; ticari sohbetler harici iletişim bilgilerini engeller.

Veriler `alceix:influencer:<creatorId>:workspace:v1` kapsamında, doğrulanarak tarayıcıda saklanır. Profil taslağı bu çalışma alanındadır. Yayımlanan demo CV `alceix:creator:<creatorId>:published:v1` anahtarına yazılır; müşteri panelinin influencer detay ekranı ortak `creator-directory` sözleşmesiyle bu kaydı okur. Farklı tarayıcı veya oturumlara sunucu senkronizasyonu yapılmaz.

Yorumlar ortak `reviews` modülünden, influencer hesabına özel kapsamla gelir. Gerçek firma teklif teslimi, sözleşme, ödeme, sosyal API istatistikleri, taşıyıcı sorgusu ve sohbet backend'i bağlı değildir. Bu rotalar gerçek kimlik doğrulama veya yetkilendirme sağlamaz.

İş kuralları ve kapsam testleri: `node --test src/modules/influencer-admin/utils/workspace.test.mjs`.
