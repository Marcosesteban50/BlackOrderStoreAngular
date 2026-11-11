import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductDTO } from '../../../Models/ProductDTO/Product';
import { ProductReviews } from '../../../Models/ReviewDTO/Review';
import { CartService } from '../../../Services/cart.service';
import { FavoriteService } from '../../../Services/favorite.service';
import { ProductService } from '../../../Services/product.service';
import { ReviewService } from '../../../Services/review.service';
import { SecurityService } from '../../../Services/security.service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  private reviewService = inject(ReviewService);
  private securityService = inject(SecurityService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  product: ProductDTO | null = null;
  reviews: ProductReviews | null = null;
  selectedImage = '';
  quantity = 1;
  loading = true;
  error = '';
  adding = false;
  isFavorite = false;
  reviewRating = 5;
  reviewComment = '';
  submittingReview = false;

  readonly stars = [1, 2, 3, 4, 5];

  get isLoggedIn(): boolean {
    return this.securityService.isLoggedIn();
  }

  get availableStock(): number {
    return Math.max(0, this.product?.stock ?? 0);
  }

  get canBuy(): boolean {
    return !!this.product && this.product.approved && this.availableStock > 0;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Producto no encontrado.';
      this.loading = false;
      return;
    }

    this.loadProduct(id);
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = '';

    this.productService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.selectedImage = product.images?.[0] ?? '';
          this.quantity = product.stock > 0 ? 1 : 0;
          this.loading = false;
          this.loadReviews(product.id);
          this.loadFavoriteState();
        },
        error: () => {
          this.error = 'No pudimos cargar este servicio.';
          this.loading = false;
        },
      });
  }

  loadReviews(productId: string): void {
    this.reviewService
      .getByProduct(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reviews) => (this.reviews = reviews),
        error: () => (this.reviews = { averageRating: 0, reviewCount: 0, items: [] }),
      });
  }

  loadFavoriteState(): void {
    if (!this.isLoggedIn) {
      return;
    }

    this.favoriteService
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (favorite) => {
          this.isFavorite = favorite.items.some(
            (item) => item.productId === this.product?.id,
          );
        },
        error: () => (this.isFavorite = false),
      });
  }

  selectImage(url: string): void {
    this.selectedImage = url;
  }

  decrease(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  increase(): void {
    this.quantity = Math.min(this.availableStock || 1, this.quantity + 1);
  }

  addToCart(): void {
    if (!this.product || this.adding || !this.canBuy) {
      return;
    }

    this.adding = true;

    this.cartService
      .addItem({
        productId: this.product.id,
        name: this.product.name,
        price: this.product.price,
        quantity: this.quantity,
        images: this.product.images,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.adding = false;
          this.toast.success('Servicio añadido al carrito.');
        },
        error: () => {
          this.adding = false;
          this.toast.error('No pudimos añadirlo al carrito.');
        },
      });
  }

  buyNow(): void {
    if (!this.product || !this.canBuy) {
      return;
    }

    this.adding = true;

    this.cartService
      .addItem({
        productId: this.product.id,
        name: this.product.name,
        price: this.product.price,
        quantity: this.quantity,
        images: this.product.images,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.adding = false;
          this.router.navigate(['/checkout']);
        },
        error: () => {
          this.adding = false;
          this.toast.error('No pudimos iniciar la compra.');
        },
      });
  }

  toggleFavorite(): void {
    if (!this.product) {
      return;
    }

    if (!this.isLoggedIn) {
      this.toast.info('Inicia sesión para guardar favoritos.');
      this.router.navigate(['/sign-in'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    const request = this.isFavorite
      ? this.favoriteService.remove(this.product.id)
      : this.favoriteService.add(this.product.id);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
        this.toast.success(
          this.isFavorite ? 'Añadido a tu lista de deseos.' : 'Quitado de deseos.',
        );
      },
      error: () => this.toast.error('No pudimos actualizar tus favoritos.'),
    });
  }

  submitReview(): void {
    if (!this.product || this.submittingReview) {
      return;
    }

    if (!this.isLoggedIn) {
      this.toast.info('Inicia sesión para dejar una reseña.');
      this.router.navigate(['/sign-in'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.submittingReview = true;

    this.reviewService
      .create(this.product.id, this.reviewRating, this.reviewComment)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submittingReview = false;
          this.reviewComment = '';
          this.toast.success('Gracias por tu reseña.');
          this.loadReviews(this.product!.id);
        },
        error: () => {
          this.submittingReview = false;
          this.toast.error('No pudimos guardar tu reseña.');
        },
      });
  }
}
