import { BaseRepository } from "./BaseRepository.js";
import Review from "../models/Review.js";

export class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }
}

export default new ReviewRepository();
