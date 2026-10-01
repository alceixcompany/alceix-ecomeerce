# Mağaza vitrini

Tek sayfalık vitrin `app/[storeSlug]/page.tsx` üzerinden açılır. Örnek mağaza: `/luma-studio`; `/magazaadi` aynı tasarımın önizleme takma adıdır. Tanımsız mağazalar 404 döner. Mevcut platform sayfaları statik rotalarıyla korunur.

`data/stores.ts` tipli demo verisidir. Gerçek API bağlanırken slug üzerinden ilgili mağaza getirilmelidir; başka mağazanın verisine varsayılan olarak düşülmemelidir. İleride `[storeSlug]/admin/...` aynı rota altında eklenebilir. Admin paneli bu tasarım aşamasına dahil değildir.

Arama, kategori, fiyat ve sıralama birlikte çalışır. Takip ve sepet sayfa açıkken bellekte tutulur. Ürün detayı/sepet native dialog ile açılır. Ödeme alınmaz, sipariş oluşturulmaz. Görseller mevcut yerel ürün varlıklarıdır. Stok, takipçi sayısı veya doğrulanmış mağaza iddiası gösterilmez.
