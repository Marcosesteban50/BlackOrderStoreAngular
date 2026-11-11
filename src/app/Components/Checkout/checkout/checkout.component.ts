import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartItemDTO } from '../../../Models/CartDTO/CartDTO';
import { CartService } from '../../../Services/cart.service';
import { OrderService } from '../../../Services/order.service';
import { SecurityService } from '../../../Services/security.service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private securityService = inject(SecurityService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  cartItems: CartItemDTO[] = [];
  total = 0;
  loadingCart = true;
  submitting = false;
  error = '';

  readonly regions = ['EU', 'US', 'LATAM', 'OCE', 'KR', 'TW'];

  form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(150)]],
    customerEmail: ['', [Validators.required, Validators.email]],
    customerDiscord: ['', [Validators.maxLength(100)]],
    characterName: ['', [Validators.maxLength(100)]],
    realm: ['', [Validators.maxLength(100)]],
    region: ['EU'],
    notes: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    if (!this.securityService.isLoggedIn()) {
      this.toast.info('Inicia sesión para completar tu compra.');
      this.router.navigate(['/sign-in'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.form.patchValue({
      customerName: this.securityService.getUserName(),
      customerEmail: this.securityService.getEmail(),
    });

    this.loadCart();
  }

  loadCart(): void {
    this.loadingCart = true;

    this.cartService
      .getCart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cart) => {
          this.cartItems = cart.items;
          this.total = cart.total;
          this.loadingCart = false;
        },
        error: () => {
          this.error = 'No pudimos cargar tu carrito.';
          this.loadingCart = false;
        },
      });
  }

  submit(): void {
    if (this.submitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.cartItems.length === 0) {
      this.toast.error('Tu carrito está vacío.');
      return;
    }

    this.submitting = true;
    this.error = '';

    const value = this.form.getRawValue();

    this.orderService
      .checkout({
        customerName: value.customerName.trim(),
        customerEmail: value.customerEmail.trim(),
        customerDiscord: value.customerDiscord.trim() || null,
        characterName: value.characterName.trim() || null,
        realm: value.realm.trim() || null,
        region: value.region || null,
        notes: value.notes.trim() || null,
        paymentMethod: 'Manual',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.submitting = false;
          this.toast.success('Pedido creado. Te contactaremos para coordinar el pago.');
          this.router.navigate(['/orders', order.id]);
        },
        error: (response) => {
          this.submitting = false;
          this.error =
            response?.error?.detail ??
            'No pudimos crear el pedido. Revisa tu carrito e intenta de nuevo.';
        },
      });
  }
}
