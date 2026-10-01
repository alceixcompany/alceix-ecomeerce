import { Inject, Injectable } from "@nestjs/common";
import { createTransport, type Transporter } from "nodemailer";
import { CONFIG, type AppConfig } from "../../../config/config";
import type { ResetMailer } from "../application/auth.repository";
import { unavailable } from "../../../shared/errors";
@Injectable()
export class SmtpMailer implements ResetMailer {
  private readonly transporter?: Transporter;
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {
    if (config.smtp)
      this.transporter = createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: config.smtp.user
          ? { user: config.smtp.user, pass: config.smtp.password }
          : undefined,
        connectionTimeout: 10000,
        socketTimeout: 10000,
      });
  }
  isConfigured() {
    return !!this.transporter;
  }
  async sendReset(email: string, token: string) {
    if (!this.transporter || !this.config.smtp)
      throw unavailable("Şifre sıfırlama e-posta servisi yapılandırılmadı.");
    const url = new URL("/sifre-sifirla", this.config.frontendOrigin);
    url.searchParams.set("token", token);
    await this.transporter.sendMail({
      from: this.config.smtp.from,
      to: email,
      subject: "Alceix şifre sıfırlama",
      text: `Şifrenizi yenilemek için bağlantı: ${url.toString()}\nBu bağlantı 30 dakika geçerlidir. Talebi siz yapmadıysanız yok sayabilirsiniz.`,
    });
  }
}
