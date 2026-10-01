import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Satışa giden yolunuzu seçin. | Alceix", description: "Kendi ürünlerinizle mağaza kurmak, tedarik ağıyla seçki hazırlamak veya içeriklerinizle iş birliği yapmak için farklı yolları inceleyin." };
export default function Page() { return <ExploreScreen slug="satis-modelleri" />; }
