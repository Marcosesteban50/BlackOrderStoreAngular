import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { OrderSummary } from '../../../Models/OrderDTO/Order';
import { OrderService } from '../../../Services/order.service';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);

  orders: OrderSummary[] = [];
  loading = true;
  error = '';
  page = 1;
  readonly pageSize = 8;
  totalPages = 0;
  status = '';

  readonly statuses = [
    { value: '', label: 'Todos' },
    { value: 'Pending', label: 'Pendientes' },
    { value: 'Paid', label: 'Pagados' },
    { value: 'Processing', label: 'En proceso' },
    { value: 'Completed', label: 'Completados' },
    { value: 'Cancelled', label: 'Cancelados' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.orderService
      .myOrders(this.page, this.pageSize, this.status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.orders = result.items;
          this.totalPages = result.totalPages;
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar tus pedidos.';
          this.loading = false;
        },
      });
  }

  filterBy(status: string): void {
    this.status = status;
    this.page = 1;
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.page = page;
    this.load();
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'Pendiente',
      Paid: 'Pagado',
      Processing: 'En proceso',
      Completed: 'Completado',
      Cancelled: 'Cancelado',
      Refunded: 'Reembolsado',
    };

    return labels[status] ?? status;
  }
}
