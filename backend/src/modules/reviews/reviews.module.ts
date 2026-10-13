import { Module } from "@nestjs/common";
import { OrdersModule } from "../orders/orders.module";
import { CollaborationModule } from "../collaboration/collaboration.module";
import { PartnersModule } from "../partners/partners.module";
import { StoresModule } from "../stores/stores.module";
import { UsersModule } from "../users/users.module";
import { REVIEWS } from "./application/reviews.repository";
import { ReviewsService } from "./application/reviews.service";
import { MongoReviewsRepository } from "./infrastructure/mongo-reviews.repository";
import { ReviewsController } from "./presentation/reviews.controller";
@Module({
  imports: [
    OrdersModule,
    CollaborationModule,
    PartnersModule,
    StoresModule,
    UsersModule,
  ],
  providers: [
    ReviewsService,
    { provide: REVIEWS, useClass: MongoReviewsRepository },
  ],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
