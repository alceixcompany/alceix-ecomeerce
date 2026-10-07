import type { Metadata } from "next";
import { ContactScreen } from "@/modules/marketing-contact/screens/contact-screen";
export const metadata: Metadata = { title: "Alceix ekibine ulaşın. | Alceix", description: "Mağaza başlangıcı, tedarik veya iş birliği hakkında sorularınız için bize yazın. Talebinizi doğru bilgiyle birlikte paylaşın." };
export default function Page() { return <ContactScreen />; }
