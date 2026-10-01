import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Alceix’te birlikte büyüyelim. | Alceix", description: "Tedarikçiler, içerik üreticileri ve hizmet ortakları için hazırlanan iş birliği alanlarını keşfedin." };
export default function Page() { return <ExploreScreen slug="is-birlikleri" />; }
