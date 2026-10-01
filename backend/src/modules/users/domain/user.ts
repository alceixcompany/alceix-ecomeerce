export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};
export type PublicUser = Pick<User, "id" | "name" | "email">;
export function publicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}
