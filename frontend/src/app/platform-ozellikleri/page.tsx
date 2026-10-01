import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Mağaza deneyiminin temel parçaları. | Alceix", description: "Alceix vitrininin mevcut özelliklerini inceleyin. Müşteriler ürün keşfinden sepete kadar tek sayfada ilerleyebilir." };
export default function Page() { return <ExploreScreen slug="platform-ozellikleri" />; }
