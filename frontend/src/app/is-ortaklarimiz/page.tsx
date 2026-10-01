import type { Metadata } from "next";
import { PartnersScreen } from "@/modules/marketing-partners/screens/partners-screen";

export const metadata: Metadata = { title: "İş Ortaklarımız | Alceix", description: "Alceix ekosisteminde sosyal ticaret, ödeme, reklam, bulut ve lojistik iş ortaklarımızı keşfedin." };
export default function PartnersPage() { return <PartnersScreen />; }
