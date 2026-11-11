import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FavoriteItem } from '../../../Models/FavoriteDTO/Favorite';
import { CartService } from '../../../Services/cart.service';
import { FavoriteService } from '../../../Services/favorite.service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  items: FavoriteItem[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.favoriteService
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (favorite) => {
          this.items = favorite.items;
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar tu lista de deseos.';
          this.loading = false;
        },
      });
  }

  addToCart(item: FavoriteItem): void {
    this.cartService
      .addItem({
        productId: item.productId,
        quantity: 1,
        name: item.productName,
        price: item.price,
        images: item.images,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toast.success(`${item.productName} añadido al carrito.`),
        error: () => this.toast.error('No pudimos añadirlo al carrito.'),
      });
  }

  remove(item: FavoriteItem): void {
    this.favoriteService
      .remove(item.productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.items = this.items.filter((entry) => entry.productId !== item.productId);
          this.toast.success('Quitado de tu lista de deseos.');
        },
        error: () => this.toast.error('No pudimos quitarlo de tus favoritos.'),
      });
  }
}
