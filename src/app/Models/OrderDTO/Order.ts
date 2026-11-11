export interface OrderSummary {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
}

export interface Order extends OrderSummary {
  subtotal: number;
  discount: number;
  customerName: string;
  customerEmail: string;
  customerDiscord: string | null;
  characterName: string | null;
  realm: string | null;
  region: string | null;
  notes: string | null;
  paymentReference: string | null;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  items: OrderItem[];
}

export interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerDiscord?: string | null;
  characterName?: string | null;
  realm?: string | null;
  region?: string | null;
  notes?: string | null;
  paymentMethod: 'Manual' | 'Stripe';
}

export interface PagedOrders {
  items: OrderSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
