import type { Metadata } from "next";
import { AboutScreen } from "@/modules/marketing-about/screens/about-screen";
export const metadata: Metadata = { title: "Hakkımızda | Alceix", description: "Alceix’in hikâyesini, ekibini ve yeni nesil e-ticaret vizyonunu keşfedin." };
export default function AboutPage() {return <AboutScreen />;}
