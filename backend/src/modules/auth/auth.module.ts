import { ReferralsModule } from "../referrals/referrals.module";
import { PlatformGuard } from "./presentation/platform.guard";
import { Global, Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { StoresModule } from "../stores/stores.module";
import {
  AUTH_REPOSITORY,
  PASSWORDS,
  MAILER,
} from "./application/auth.repository";
import { AuthService } from "./application/auth.service";
import { MongoAuthRepository } from "./infrastructure/mongo-auth.repository";
import { ScryptPasswords } from "./infrastructure/scrypt-passwords";
import { SmtpMailer } from "./infrastructure/smtp-mailer";
import { AuthController } from "./presentation/auth.controller";
import { SessionGuard } from "./presentation/session.guard";
@Global()
@Module({
  imports: [ReferralsModule, UsersModule, StoresModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionGuard,
    PlatformGuard,
    { provide: AUTH_REPOSITORY, useClass: MongoAuthRepository },
    { provide: PASSWORDS, useClass: ScryptPasswords },
    { provide: MAILER, useClass: SmtpMailer },
  ],
  exports: [AuthService, SessionGuard, PlatformGuard],
})
export class AuthModule {}
