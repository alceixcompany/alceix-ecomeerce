import type { Metadata } from "next";
import { DropshippingScreen } from "@/modules/marketing-dropshipping/screens/dropshipping-screen";

export const metadata: Metadata = { title: "Dropshipping & Tedarik | Alceix", description: "Alceix dropshipping ve tedarik ağı: hazır ürün kataloğu, mağaza özelleştirme ve entegre lojistik çözümleri." };
export default function DropshippingPage() { return <DropshippingScreen />; }
