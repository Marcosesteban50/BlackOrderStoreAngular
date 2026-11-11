import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderSummary } from '../../../Models/OrderDTO/Order';
import { OrderService } from '../../../Services/order.service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-admin-orders',
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css',
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  orders: OrderSummary[] = [];
  loading = true;
  error = '';
  page = 1;
  readonly pageSize = 10;
  totalPages = 0;
  status = '';
  search = '';
  busyId: string | null = null;

  readonly statuses = [
    { value: '', label: 'Todos' },
    { value: 'Pending', label: 'Pendientes' },
    { value: 'Paid', label: 'Pagados' },
    { value: 'Processing', label: 'En proceso' },
    { value: 'Completed', label: 'Completados' },
    { value: 'Cancelled', label: 'Cancelados' },
  ];

  private readonly transitions: Record<string, string[]> = {
    Pending: ['Paid', 'Cancelled'],
    Paid: ['Processing', 'Cancelled', 'Refunded'],
    Processing: ['Completed', 'Cancelled'],
    Completed: ['Refunded'],
    Cancelled: [],
    Refunded: [],
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.orderService
      .adminOrders(this.page, this.pageSize, this.status, this.search.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.orders = result.items;
          this.totalPages = result.totalPages;
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar los pedidos.';
          this.loading = false;
        },
      });
  }

  filterBy(status: string): void {
    this.status = status;
    this.page = 1;
    this.load();
  }

  applySearch(): void {
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

  nextStatuses(status: string): string[] {
    return this.transitions[status] ?? [];
  }

  updateStatus(order: OrderSummary, status: string): void {
    if (!status || this.busyId) {
      return;
    }

    this.busyId = order.id;

    this.orderService
      .updateStatus(order.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId = null;
          this.toast.success(`Pedido actualizado a ${this.statusLabel(status)}.`);
          this.load();
        },
        error: (response) => {
          this.busyId = null;
          this.toast.error(
            response?.error?.detail ?? 'No pudimos cambiar el estado del pedido.',
          );
          this.load();
        },
      });
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
