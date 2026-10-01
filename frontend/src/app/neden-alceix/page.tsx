import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Markanızın yeni başlangıcı: Alceix. | Alceix", description: "Mağaza vitrini, ürün seçkisi ve iş birlikleri. E-ticaret yolculuğunuzun farklı adımlarını aynı ekosistemde keşfedin." };
export default function Page() { return <ExploreScreen slug="neden-alceix" />; }
