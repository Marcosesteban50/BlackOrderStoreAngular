import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCreationDTO, ProductDTO } from '../../../Models/ProductDTO/Product';
import { ProductService } from '../../../Services/product.service';
import { ToastService } from '../../../Services/toast.service';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-edit-product',
  imports: [ProductFormComponent],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css',
})
export class EditProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  product: ProductDTO | null = null;
  loading = true;
  error = '';
  saving = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Servicio no encontrado.';
      this.loading = false;
      return;
    }

    this.productService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar este servicio.';
          this.loading = false;
        },
      });
  }

  save(product: ProductCreationDTO): void {
    if (!this.product || this.saving) {
      return;
    }

    this.saving = true;

    this.productService
      .update(this.product.id, product)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          this.toast.success('Servicio actualizado.');
          this.router.navigate(['/seller']);
        },
        error: () => {
          this.saving = false;
          this.toast.error('No pudimos guardar los cambios.');
        },
      });
  }
}
