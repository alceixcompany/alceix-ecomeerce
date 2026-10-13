import type { Review } from "../domain/review";
import type { PageQuery } from "../../../shared/page";
export const REVIEWS = Symbol("REVIEWS");
export interface ReviewsRepository {
  find(id: string): Promise<Review | null>;
  bySource(sourceId: string, authorId: string): Promise<Review | null>;
  create(review: Review): Promise<void>;
  save(review: Review, version: number): Promise<Review | null>;
  list(
    subjectId: string | undefined,
    query: PageQuery,
    publicOnly: boolean,
  ): Promise<{
    items: Review[];
    total: number;
    page: number;
    pages: number;
    rating: number | null;
    count: number;
  }>;
}
