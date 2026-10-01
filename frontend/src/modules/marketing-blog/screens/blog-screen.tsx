import { MarketingPage } from "@/components/layout/marketing-page";
import { PageIntro } from "@/components/layout/page-intro";
import { BlogList } from "../components/blog-list";
import "../blog.css";
export function BlogScreen() { return <MarketingPage className="blog-page"><PageIntro eyebrow="Alceix Blog" title={<>Fikirler, rehberler,<br /><span>yeni başlangıçlar.</span></>} description="Mağaza kurulumundan ürün sunumuna, e-ticaret yolculuğunuz için sade ve uygulanabilir içerikler." /><BlogList /></MarketingPage>; }
