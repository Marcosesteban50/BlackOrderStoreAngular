import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../../Models/OrderDTO/Order';
import { OrderService } from '../../../Services/order.service';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);

  order: Order | null = null;
  loading = true;
  error = '';
  notFound = false;

  readonly steps = [
    { key: 'Pending', label: 'Pedido creado', icon: 'bi-receipt' },
    { key: 'Paid', label: 'Pago confirmado', icon: 'bi-credit-card' },
    { key: 'Processing', label: 'En proceso', icon: 'bi-gear' },
    { key: 'Completed', label: 'Completado', icon: 'bi-check2-circle' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.load(id);
  }

  load(id: string): void {
    this.loading = true;
    this.error = '';

    this.orderService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.loading = false;
        },
        error: (response) => {
          this.loading = false;

          if (response?.status === 404) {
            this.notFound = true;
          } else {
            this.error = 'No pudimos cargar este pedido.';
          }
        },
      });
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'Pendiente de pago',
      Paid: 'Pagado',
      Processing: 'En proceso',
      Completed: 'Completado',
      Cancelled: 'Cancelado',
      Refunded: 'Reembolsado',
    };

    return labels[status] ?? status;
  }

  stepState(step: string): 'done' | 'current' | 'pending' {
    if (!this.order) {
      return 'pending';
    }

    if (this.order.status === 'Cancelled' || this.order.status === 'Refunded') {
      return step === 'Pending' ? 'done' : 'pending';
    }

    const order = ['Pending', 'Paid', 'Processing', 'Completed'];
    const currentIndex = order.indexOf(this.order.status);
    const stepIndex = order.indexOf(step);

    if (stepIndex < currentIndex) {
      return 'done';
    }

    return stepIndex === currentIndex ? 'current' : 'pending';
  }
}
