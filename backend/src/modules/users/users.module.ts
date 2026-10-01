import { Module } from "@nestjs/common";
import { USERS } from "./application/users.repository";
import { UsersService } from "./application/users.service";
import { MongoUsersRepository } from "./infrastructure/mongo-users.repository";
@Module({
  providers: [UsersService, { provide: USERS, useClass: MongoUsersRepository }],
  exports: [UsersService],
})
export class UsersModule {}
