import type { Metadata } from "next";
import { InfluencerScreen } from "@/modules/marketing-influencer/screens/influencer-screen";

export const metadata: Metadata = { title: "Influencer Ol | Alceix", description: "Alceix Influencer Partner Programı: kişisel ürün seçkileri, satış ortaklığı ve içerik üreticileri için komisyon fırsatları." };
export default function InfluencerPage() { return <InfluencerScreen />; }
