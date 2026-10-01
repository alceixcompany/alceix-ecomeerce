import { Injectable, Inject } from "@nestjs/common";
import { USERS, type UsersRepository } from "./users.repository";
import type { User } from "../domain/user";
@Injectable()
export class UsersService {
  constructor(@Inject(USERS) private readonly repository: UsersRepository) {}
  create(user: User) {
    return this.repository.create(user);
  }
  findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }
  findById(id: string) {
    return this.repository.findById(id);
  }
  changePassword(id: string, hash: string) {
    return this.repository.changePassword(id, hash);
  }
}
