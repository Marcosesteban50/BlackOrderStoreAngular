import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../Services/cart.service';
import { CartItemDTO } from '../../../Models/CartDTO/CartDTO';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  cart: CartItemDTO[] = [];
  total: number = 0;
  loading = true;
  error: string | null = null;

  cartService = inject(CartService);

  ngOnInit(): void {
    this.loadCart();
  }

  get itemCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  loadCart() {
    this.loading = true;
    this.error = null;
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cart = data.items;
        this.total = data.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.error = 'Could not load your cart. Please try again.';
        this.loading = false;
      },
    });
  }

  delete(id: string) {
    this.cartService.deleteItem(id).subscribe({
      next: (data) => {
        this.loadCart();
      },
      error: (err) => {
        console.error('Error deleting item:', err);
      },
    });
  }

  cleanCart() {
    this.cartService.cleanCart().subscribe({
      next: (data) => {
        this.loadCart();
      },
      error: (err) => {
        console.error('Error cleaning cart:', err);
      },
    });
  }

  reduceQuantity(id: string) {
    this.cartService.deleteOneItem(id).subscribe({
      next: (data) => {
        this.loadCart();
      },
      error: (err) => {
        console.error('Error reducing quantity:', err);
      },
    });
  }

  addQuantity(id: string) {
    this.cartService.addItem({ productId: id, quantity: 1 }).subscribe({
      next: (data) => {
        this.loadCart();
      },
      error: (err) => {
        console.error('Error adding quantity:', err);
      },
    });
  }

  checkout() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to proceed to checkout.');
      return;
    }
    //   const direccion = this.perfilUsuario?.direccionEnvio;
    // console.log('Perfil:', this.perfilUsuario);
    // console.log('Dirección:', this.perfilUsuario?.direccionEnvio);
  }
}
