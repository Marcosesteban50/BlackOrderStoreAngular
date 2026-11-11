import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminDashboard } from '../../../Models/AdminDTO/Admin';
import { ProductDTO } from '../../../Models/ProductDTO/Product';
import { AdminService } from '../../../Services/admin.service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  dashboard: AdminDashboard | null = null;
  pending: ProductDTO[] = [];
  loading = true;
  error = '';
  busyId: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.adminService
      .getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar el panel.';
          this.loading = false;
        },
      });

    this.adminService
      .pendingProducts(1, 6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => (this.pending = result.items),
        error: () => (this.pending = []),
      });
  }

  approve(product: ProductDTO): void {
    this.setApproval(product, true);
  }

  reject(product: ProductDTO): void {
    this.setApproval(product, false);
  }

  private setApproval(product: ProductDTO, approved: boolean): void {
    this.busyId = product.id;

    const request = approved
      ? this.adminService.approveProduct(product.id)
      : this.adminService.rejectProduct(product.id);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.busyId = null;
        this.pending = this.pending.filter((item) => item.id !== product.id);
        this.toast.success(
          approved ? `${product.name} aprobado.` : `${product.name} rechazado.`,
        );
        this.load();
      },
      error: () => {
        this.busyId = null;
        this.toast.error('No pudimos actualizar el producto.');
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
