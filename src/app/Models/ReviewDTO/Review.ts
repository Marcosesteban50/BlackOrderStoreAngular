export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ProductReviews {
  averageRating: number;
  reviewCount: number;
  items: Review[];
}
