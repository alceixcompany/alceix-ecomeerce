import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Mağazanızın müşterilere açılan yüzü. | Alceix", description: "Bir banner, özenli bir ürün seçkisi ve anlaşılır kategoriler. Müşterilerinizin gördüğü tek sayfalık mağazayı keşfedin." };
export default function Page() { return <ExploreScreen slug="magaza-ve-vitrin" />; }
