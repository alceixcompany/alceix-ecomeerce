import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Ürünlerinize yakından bakın. | Alceix", description: "Giyimden ev yaşamına: temiz görseller, anlaşılır açıklamalar ve görünür fiyatlarla hazırlanan örnek ürün sunumlarını keşfedin." };
export default function Page() { return <ExploreScreen slug="urun-vitrinleri" />; }
