import { Inject, Injectable } from "@nestjs/common";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import {
  AUTH_REPOSITORY,
  PASSWORDS,
  MAILER,
  type AuthRepository,
  type PasswordHasher,
  type ResetMailer,
} from "./auth.repository";
import { UsersService } from "../../users/application/users.service";
import { publicUser, type PublicUser } from "../../users/domain/user";
import { StoresService } from "../../stores/application/stores.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { CONFIG, type AppConfig } from "../../../config/config";
import { AppError, unavailable, unauthorized } from "../../../shared/errors";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly repository: AuthRepository,
    @Inject(PASSWORDS) private readonly passwords: PasswordHasher,
    @Inject(MAILER) private readonly mailer: ResetMailer,
    private readonly users: UsersService,
    private readonly stores: StoresService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  async register(input: {
    name: string;
    email: string;
    password: string;
    store: string;
  }) {
    const passwordHash = await this.passwords.hash(input.password);
    return this.tx.run(async () => {
      const user = {
        id: randomUUID(),
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        createdAt: new Date(),
      };
      await this.users.create(user);
      const store = await this.stores.createOwned(user.id, input.store);
      return {
        ...(await this.issue(publicUser(user))),
        stores: [{ id: store.id, slug: store.slug, name: store.name }],
      };
    });
  }
  private async issue(user: PublicUser) {
    const token = randomBytes(32).toString("hex"),
      expiresAt = new Date(Date.now() + this.config.sessionDays * 86400000);
    await this.repository.createSession({
      hash: digest(token),
      userId: user.id,
      expiresAt,
    });
    return { user, token, expiresAt };
  }
  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email.toLowerCase());
    // Run the same expensive hash work even when the account does not exist.
    const valid = user
      ? await this.passwords.verify(password, user.passwordHash)
      : (await this.passwords.hash(password), false);
    if (!user || !valid)
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "E-posta veya şifre hatalı.",
      );
    const issued = await this.issue(publicUser(user));
    return {
      ...issued,
      stores: (await this.stores.ownedBy(user.id)).map((store) => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
      })),
    };
  }
  async actor(token?: string) {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const session = await this.repository.findSession(digest(token));
    if (!session) return null;
    const user = await this.users.findById(session.userId);
    return user ? publicUser(user) : null;
  }
  async me(token?: string) {
    const user = await this.actor(token);
    if (!user) throw unauthorized();
    return {
      user,
      stores: (await this.stores.ownedBy(user.id)).map((store) => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
      })),
    };
  }
  async logout(token?: string) {
    if (token) await this.repository.deleteSession(digest(token));
  }
  async forgot(email: string) {
    if (!this.mailer.isConfigured())
      throw unavailable(
        "Şifre sıfırlama e-posta servisi henüz yapılandırılmadı.",
      );
    const user = await this.users.findByEmail(email.toLowerCase());
    if (user) {
      const token = randomBytes(32).toString("hex");
      await this.repository.saveReset({
        hash: digest(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 60000),
      });
      try {
        await this.mailer.sendReset(user.email, token);
      } catch {
        throw unavailable("E-posta servisi şu anda kullanılamıyor.");
      }
    }
    return {
      message:
        "Bu e-posta ile bir hesap varsa sıfırlama bağlantısı gönderildi.",
    };
  }
  async reset(token: string, password: string) {
    const passwordHash = await this.passwords.hash(password);
    await this.tx.run(async () => {
      const reset = await this.repository.consumeReset(digest(token));
      if (!reset)
        throw new AppError(
          422,
          "INVALID_RESET_TOKEN",
          "Bağlantı geçersiz veya süresi dolmuş.",
        );
      await this.users.changePassword(reset.userId, passwordHash);
      await this.repository.deleteUserSessions(reset.userId);
    });
    return { message: "Şifreniz yenilendi. Yeniden giriş yapın." };
  }
}
