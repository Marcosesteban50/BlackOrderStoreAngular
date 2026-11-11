import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ProductDTO } from '../../../Models/ProductDTO/Product';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../Services/product.service';
import { CategoryDTO } from '../../../Models/CategoryDTO/Category';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { CartService } from '../../../Services/cart.service';
import { FavoriteService } from '../../../Services/favorite.service';
import { SecurityService } from '../../../Services/security.service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-list-products',
  imports: [UpperCasePipe, CurrencyPipe, RouterLink],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css',
})
export class ListProductsComponent implements OnInit {
  private router = inject(Router);
  private ProductService = inject(ProductService);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  private toast = inject(ToastService);

  readonly security = inject(SecurityService);

  @Input({ required: true })
  productList: ProductDTO[] = [];

  @Output()
  deleteProduct = new EventEmitter<string>();

  category?: CategoryDTO;
  loading = false;
  error: string | null = null;
  favoriteIds = new Set<string>();

  ngOnInit(): void {
    if (this.security.isLoggedIn()) {
      this.favoriteService.get().subscribe({
        next: (favorite) => {
          this.favoriteIds = new Set(
            favorite.items.map((item) => item.productId),
          );
        },
        error: () => {
          this.favoriteIds = new Set();
        },
      });
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds.has(productId);
  }

  toggleFavorite(product: ProductDTO): void {
    if (!this.security.isLoggedIn()) {
      this.toast.info('Inicia sesión para guardar favoritos.');
      this.router.navigate(['/sign-in'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    const isFavorite = this.isFavorite(product.id);
    const request = isFavorite
      ? this.favoriteService.remove(product.id)
      : this.favoriteService.add(product.id);

    request.subscribe({
      next: () => {
        if (isFavorite) {
          this.favoriteIds.delete(product.id);
        } else {
          this.favoriteIds.add(product.id);
        }

        this.toast.success(
          isFavorite ? 'Quitado de tu lista de deseos.' : 'Añadido a tu lista de deseos.',
        );
      },
      error: () => this.toast.error('No pudimos actualizar tus favoritos.'),
    });
  }

  delete(id: string) {
    this.deleteProduct.emit(id);
  }

  addToCart(product: ProductDTO) {
    if (product.stock <= 0) {
      this.toast.error('Este servicio está agotado.');
      return;
    }

    this.cartService
      .addItem({
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
        images: product.images,
      })
      .subscribe({
        next: () => {
          this.toast.success(`${product.name} añadido al carrito.`);
        },
        error: () => {
          this.toast.error('No pudimos añadirlo al carrito.');
        },
      });
  }
}
