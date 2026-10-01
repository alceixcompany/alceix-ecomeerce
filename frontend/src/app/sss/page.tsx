import type { Metadata } from "next";
import { FaqScreen } from "@/modules/marketing-faq/screens/faq-screen";

export const metadata: Metadata = { title: "Sıkça Sorulan Sorular | Alceix", description: "Alceix, dropshipping, influencer iş birlikleri ve tedarik süreçleri hakkında sıkça sorulan sorular." };
export default function FaqPage() { return <FaqScreen />; }
