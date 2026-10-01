import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Alceix ekibine ulaşın. | Alceix", description: "Mağaza başlangıcı, tedarik veya iş birliği hakkında sorularınız için bize yazın. Talebinizi doğru bilgiyle birlikte paylaşın." };
export default function Page() { return <ExploreScreen slug="iletisim" />; }
