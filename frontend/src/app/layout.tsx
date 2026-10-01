import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alceix | 0 TL ile E-Ticaret Sitenizi Açın",
  description: "Alceix ile e-ticaret mağazanızı kurun; dropshipping, influencer satış ortaklığı ve kargo araçlarını tek platformda yönetin.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}
