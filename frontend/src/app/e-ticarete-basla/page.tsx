import type { Metadata } from "next";
import { ExploreScreen } from "@/modules/marketing-explore/screens/explore-screen";
export const metadata: Metadata = { title: "Fikrinizden ilk vitrininize. | Alceix", description: "Ne satacağınızı belirleyin, ürünlerinizi hazırlayın ve markanızın müşterilerle buluşacağı mağaza deneyimini planlayın." };
export default function Page() { return <ExploreScreen slug="e-ticarete-basla" />; }
