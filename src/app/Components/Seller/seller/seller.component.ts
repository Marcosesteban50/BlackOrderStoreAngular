import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProductDTO } from '../../../Models/ProductDTO/Product';
import { ProductService } from '../../../Services/product.service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-seller',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './seller.component.html',
  styleUrl: './seller.component.css',
})
export class SellerComponent implements OnInit {
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  products: ProductDTO[] = [];
  loading = true;
  error = '';
  deletingId: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.productService
      .mine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar tus servicios.';
          this.loading = false;
        },
      });
  }

  remove(product: ProductDTO): void {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.deletingId = product.id;

    this.productService
      .delete(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingId = null;
          this.products = this.products.filter((item) => item.id !== product.id);
          this.toast.success('Servicio eliminado.');
        },
        error: () => {
          this.deletingId = null;
          this.toast.error('No pudimos eliminar el servicio.');
        },
      });
  }
}
