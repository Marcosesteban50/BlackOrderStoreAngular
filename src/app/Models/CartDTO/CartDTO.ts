export interface CartDTO {
  id: string;
  items: CartItemDTO[];
  total: number;
}

export interface CartItemDTO {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  images?: string[];
}
