import type { User } from "../domain/user";
export const USERS = Symbol("USERS");
export interface UsersRepository {
  create(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  changePassword(id: string, passwordHash: string): Promise<void>;
}
