import type { Metadata } from "next";
import { AuthScreen } from "@/modules/marketing-auth/screens/auth-screen";

export const metadata: Metadata = { title: "Giriş Yap | Alceix", description: "Alceix hesabınıza giriş yapın.", robots: { index: false, follow: true } };
export default function LoginPage() { return <AuthScreen mode="login" />; }
