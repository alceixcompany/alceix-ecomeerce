"use client";

import { useState } from "react";
import "./customer-reviews.css";

// Static review content supplied in the design reference.
const reviews = [
  { name: "Ahmet Tunç", role: "Proje Müdürü", company: "Yılmaz Lojistik", quote: "Dijital dönüşüm sürecimizde Alceix'in danışmanlık hizmetleri çok değerliydi. İş süreçlerimiz optimize edildi ve verimliliğimiz arttı." },
  { name: "Ayşe Kaya", role: "Ürün Geliştirme Müdürü", company: "Arvento Labs", quote: "Web tasarım projemizde modern ve kullanıcı dostu bir çözüm sundular. Site trafiğimiz %250 arttı ve dönüşüm oranları yükseldi." },
  { name: "Selin Taş", role: "CEO", company: "", quote: "Alceix ile çalışmak gerçekten harika bir deneyimdi. Projemizi zamanında ve bütçe dahilinde tamamladılar. Teknik ekipleri çok profesyonel ve çözüm odaklı." },
  { name: "Ayşe Gür", role: "Pazarlama Müdürü", company: "Valtrix Solutions", quote: "SEO ve performans reklamcılığı konularında aldığımız destekle dönüşüm oranlarımız ciddi anlamda arttı." },
  { name: "Nazlı Erel", role: "Finans Direktörü", company: "Techsenta Global", quote: "Raporlama sistemlerinde sağladıkları entegrasyonlar sayesinde mali işler departmanımızda büyük kolaylık sağlandı." },
  { name: "Onur Tekin", role: "UI Developer", company: "Brixera Creative", quote: "Bulut çözümleri konusundaki rehberlik hizmetlerimiz işimizi kolaylaştırdı. Altyapı maliyetlerimiz %40 azaldı." },
  { name: "Yusuf Çelik", role: "IT Müdürü", company: "Arslan Holdings", quote: "Sistem entegrasyonlarımızda yaşadığımız sorunları hızlıca çözdüler. 7/24 destek hizmetleri sayesinde işlerimiz aksama yaşanmadı." },
  { name: "Melis Aydın", role: "Proje Müdürü", company: "Clevora Yazılım", quote: "Proje yönetimi süreçlerinde gösterdikleri profesyonellik etkileyiciydi. Her milestone zamanında teslim edildi." },
  { name: "Sena Dursun", role: "İş Geliştirme Direktörü", company: "", quote: "Mobil uygulamamızı geliştirirken Alceix ekibi her aşamada bizimle birlikte hareket etti. Sonuç beklentilerimizi aştı." },
];

type Review = (typeof reviews)[number];
function ReviewCard({ review }: { review: Review }) {
  return <figure className="customer-review-card"><blockquote>“{review.quote}”</blockquote><figcaption><span className="customer-review-avatar" aria-hidden="true">{review.name.split(" ").map(part => part[0]).join("")}</span><span><strong>{review.name}</strong><span className="customer-review-role">{review.role}</span>{review.company && <span className="customer-review-company">{review.company}</span>}</span></figcaption></figure>;
}
function ReviewLane({ items }: { items: Review[] }) {
  return <div className="customer-review-lane"><div className="customer-review-track">{[false, true].map(duplicate => <div className="customer-review-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>{items.map(review => <ReviewCard key={review.name} review={review} />)}</div>)}</div></div>;
}
export function CustomerReviews() {
  const [paused, setPaused] = useState(false);
  return <section className="customer-reviews" aria-label="Müşteri yorumları" data-paused={paused}><div className="customer-reviews-inner"><div className="customer-reviews-heading"><h2>Müşterilerimiz <span>Ne Diyor?</span></h2><p>Başarılı projelerimizde bizimle çalışan müşterilerimizin deneyimleri</p><button type="button" className="customer-reviews-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}><span className="material-symbols-outlined" aria-hidden="true">{paused ? "play_arrow" : "pause"}</span>{paused ? "Akışı devam ettir" : "Akışı durdur"}</button></div><div className="customer-reviews-desktop">{[0, 3, 6].map(start => <ReviewLane key={start} items={reviews.slice(start, start + 3)} />)}</div><div className="customer-reviews-mobile"><ReviewLane items={reviews} /></div></div></section>;
}
