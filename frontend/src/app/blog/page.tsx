import type { Metadata } from "next";
import { BlogScreen } from "@/modules/marketing-blog/screens/blog-screen";
export const metadata: Metadata = { title: "Alceix Blog | E-Ticaret Rehberleri", description: "Mağaza kurulumu, ürün sunumu ve dropshipping hakkında Alceix rehberleri." };
export default function Page() { return <BlogScreen />; }
