export interface FavoriteItem {
  productId: string;
  productName: string;
  price: number;
  images: string[];
}

export interface Favorite {
  id: string;
  items: FavoriteItem[];
}
