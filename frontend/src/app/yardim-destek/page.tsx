import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "İlk adımda da yanınızdayız. | Alceix", description: "Hesap, mağaza ve satış modelleri hakkında merak ettiklerinizi bulun. İhtiyacınız olan sayfaya kolayca ulaşın." };
export default function Page() { return <ExploreScreen slug="yardim-destek" />; }
