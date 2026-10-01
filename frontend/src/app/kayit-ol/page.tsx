import type { Metadata } from "next";
import { AuthScreen } from "@/modules/marketing-auth/screens/auth-screen";

export const metadata: Metadata = { title: "Kayıt Ol | Alceix", description: "Alceix ile e-ticaret yolculuğunuza başlayın.", robots: { index: false, follow: true } };
export default function RegisterPage() { return <AuthScreen mode="register" />; }
