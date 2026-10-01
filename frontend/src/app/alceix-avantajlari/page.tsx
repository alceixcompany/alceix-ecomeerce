import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Başlangıcınızı sadeleştiren bir vitrin. | Alceix", description: "Ürünlerinizi tek bir bağlantıda bir araya getirin. Müşterilerinize düzenli bir seçki sunarak mağazanızı anlatmayı kolaylaştırın." };
export default function Page() { return <ExploreScreen slug="alceix-avantajlari" />; }
