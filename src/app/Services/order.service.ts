import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CheckoutRequest,
  Order,
  OrderSummary,
  PagedOrders,
} from '../Models/OrderDTO/Order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/Order';

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${this.urlBase}/Checkout`, request);
  }

  myOrders(page = 1, pageSize = 10, status = ''): Observable<PagedOrders> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PagedOrders>(`${this.urlBase}/MyOrders`, { params });
  }

  adminOrders(
    page = 1,
    pageSize = 10,
    status = '',
    search = '',
  ): Observable<PagedOrders> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PagedOrders>(`${this.urlBase}/Admin`, { params });
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.urlBase}/${id}`);
  }

  updateStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.urlBase}/${id}/Status`, { status });
  }

  toSummary(order: Order): OrderSummary {
    return {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      itemCount: order.items.length,
      createdAt: order.createdAt,
    };
  }
}
