export type Session = { hash: string; userId: string; expiresAt: Date };
export type Reset = { hash: string; userId: string; expiresAt: Date };
export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");
export interface AuthRepository {
  createSession(session: Session): Promise<void>;
  findSession(hash: string): Promise<Session | null>;
  deleteSession(hash: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  saveReset(reset: Reset): Promise<void>;
  consumeReset(hash: string): Promise<Reset | null>;
}
export const PASSWORDS = Symbol("PASSWORDS");
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}
export const MAILER = Symbol("MAILER");
export interface ResetMailer {
  isConfigured(): boolean;
  sendReset(email: string, token: string): Promise<void>;
}
