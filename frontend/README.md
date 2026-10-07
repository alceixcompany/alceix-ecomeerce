# Frontend

## Tedarikçi yönetimi

Panel: `/tedarikci/modatekstil/admin` (diğer firma slug'ları da desteklenir).

- `/urunler`: B2B katalog, ürün ekleme/düzenleme, yayın durumu, stok, arama, filtre, sıralama, sayfalama ve CSV dışa aktarma.
- `/finans`: hakediş özeti, işlem filtreleri, IBAN düzenleme, örnek aktarım tercihi ve komisyon simülatörü.
- `/siparisler`: yalnızca bağlı aktif Alceix mağazalarına sipariş oluşturma, minimum adet/stok kontrolü, sipariş ayrıntısı, kargo takibi ve paketleme listesi.
- `/studyo`: model/sahne ayarları, dört örnek görsel varyasyonu, galeri, indirme ve katalog kapak görseli seçimi.
- `/mesajlar`: bağlı mağazalarla yerel sohbet; harici bağlantı, e-posta ve telefon paylaşımı engellenir.
- `/ekip`: davet taslağı, görev seçimi, rol düzenleme ve ekip kaydını duraklatma.
- `/destek`: talep oluşturma, arama, durum filtresi, yanıt, kapatma ve yeniden açma.

Veriler firma bazında tarayıcıda saklanır. Ek araçların kaydı `alceix:supplier:<firma-id>:tools:v1` anahtarında doğrulanarak yüklenir. Bunlar demo akışlarıdır: gerçek AI üretimi, ödeme/IBAN aktarımı, kargo entegrasyonu, e-posta daveti, sunucu mesajlaşması ve kullanıcı yetkilendirmesi bağlı değildir. AI stüdyo mevcut örnek görselleri kullanır; krediler örnek sayaçtır. Siparişler son tüketiciye satış açmaz.

Doğrulama: `node --test src/modules/supplier-admin/utils/*.test.mjs`, `npm run lint`, `npm run build`.

Geliştirmeye başlamadan önce [frontend geliştirme kurallarını](./AGENTS.md) okuyun. Modül yapısı, rota düzeni, veri erişimi ve devir teslim standartları bu dosyada tanımlıdır.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
