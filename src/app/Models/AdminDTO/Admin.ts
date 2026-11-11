import { OrderSummary } from '../OrderDTO/Order';

export interface TopProduct {
  productId: string | null;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface AdminDashboard {
  totalRevenue: number;
  ordersTotal: number;
  ordersToday: number;
  pendingOrders: number;
  pendingProducts: number;
  customers: number;
  lowStockProducts: number;
  recentOrders: OrderSummary[];
  topProducts: TopProduct[];
}
