import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { SecurityService } from './security.service';
import { CartDTO, CartItemDTO } from '../Models/CartDTO/CartDTO';
import { ProductDTO } from '../Models/ProductDTO/Product';

type CartItemResponse = Partial<CartItemDTO> & {
  productoId?: string;
  amount?: number;
  imagenUrl?: string;
  product?: ProductDTO;
};

type CartResponse = {
  id?: string;
  total?: number;
  items?: CartItemResponse[];
};

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiURL + '/Cart';
  private storageKey = 'guest_cart';
  private securityService = inject(SecurityService);
  private cartAmountSource = new BehaviorSubject<number>(0);

  cartAmount$ = this.cartAmountSource.asObservable();

  //--------------------------------
  getLocalcart() {
    const data = localStorage.getItem(this.storageKey);
    const items = data ? JSON.parse(data) : [];

    const total = items.reduce((acc: number, item: CartItemResponse) => {
      const quantity = Number(item.quantity ?? item.amount ?? 0);
      return acc + Number(item.price ?? 0) * quantity;
    }, 0);
    // this.cartAmountSource.next(total);

    return { items: items, total: total };
  }

  //--------------------------------
  getCart() {
    if (this.securityService.isLoggedIn()) {
      return this.http
        .get<CartResponse>(this.apiUrl + '/GetCart')
        .pipe(map((cart) => this.normalizeCart(cart)));
    }

    const cart = this.getLocalcart();
    return of(
      this.normalizeCart({ id: '', total: cart.total, items: cart.items }),
    );
  }

  updateQuantity() {
    if (this.securityService.isLoggedIn()) {
      this.getCart().subscribe({
        next: (cart) => {
          this.cartAmountSource.next(
            cart.items.reduce((count, item) => count + item.quantity, 0),
          );
        },
        error: (error) => {
          console.error('Error updating cart count:', error);
        },
      });
      return;
    }

    const cart = this.getLocalcart().items;
    this.cartAmountSource.next(
      cart.reduce((count: number, item: CartItemResponse) => {
        return count + Number(item.quantity ?? item.amount ?? 0);
      }, 0),
    );
  }

  private normalizeCart(cart: CartResponse): CartDTO {
    const items: CartItemDTO[] = (cart.items ?? []).map((item) => {
      const product = item.product;
      const quantity = Number(item.quantity ?? item.amount ?? 0);
      const price = Number(product?.price ?? item.price ?? 0);

      return {
        productId: item.productId ?? product?.id ?? '',
        name: product?.name ?? item.name ?? '',
        price,
        quantity,
        subtotal: price * quantity,
        images: product?.images ?? item.images ?? [],
      };
    });

    return {
      id: cart.id ?? '',
      items,
      total: Number(
        cart.total ?? items.reduce((total, item) => total + item.subtotal, 0),
      ),
    };
  }

  private saveLocalCart(cart: CartItemResponse[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  //--------------------------------
  addItem(dto: {
    productId: string;
    name?: string;
    price?: number;
    quantity: number;
    images?: string[];
  }) {
    if (this.securityService.isLoggedIn()) {
      return this.http.post(this.apiUrl + '/AddItem', dto).pipe(
        tap(() => {
          this.updateQuantity();
        }),
      );
    }

    const cart = this.getLocalcart().items;

    const itemExists = cart.find((item: CartItemResponse) => {
      return (item.productId ?? item.productoId) === dto.productId;
    });

    if (itemExists) {
      itemExists.quantity =
        Number(itemExists.quantity ?? itemExists.amount ?? 0) + dto.quantity;
    } else {
      cart.push({
        productId: dto.productId,
        name: dto.name,
        price: dto.price,
        imagenUrl: dto.images?.[0],
        quantity: dto.quantity,
      });
    }

    this.saveLocalCart(cart);
    this.updateQuantity();
    return of({ ok: true });
  }

  deleteItem(productId: string) {
    if (this.securityService.isLoggedIn()) {
      return this.http.delete(this.apiUrl + '/RemoveItem/' + productId).pipe(
        tap(() => {
          this.updateQuantity();
        }),
      );
    }

    let cart = this.getLocalcart().items;

    cart = cart.filter((item: CartItemResponse) => {
      // Conserva el producto si su ID es diferente al que queremos eliminar.
      // Si los ID son iguales, devuelve false y .filter() lo elimina.
      // ?? utiliza productoId si productId es null o undefined.
      return (item.productId ?? item.productoId) !== productId;
    });
    this.saveLocalCart(cart);
    this.updateQuantity();
    return of({ ok: true });
  }

  deleteOneItem(productId: string) {
    if (this.securityService.isLoggedIn()) {
      return this.http.delete(this.apiUrl + '/RemoveOneItem/' + productId).pipe(
        tap(() => {
          this.updateQuantity();
        }),
      );
    }

    let cart = this.getLocalcart().items;

    const item = cart.find((item: CartItemResponse) => {
      return (item.productId ?? item.productoId) === productId;
    });

    if (item) {
      item.quantity = Number(item.quantity ?? item.amount ?? 0) - 1;

      if (item.quantity <= 0) {
        cart = cart.filter((cartItem: CartItemResponse) => {
          return (cartItem.productId ?? cartItem.productoId) !== productId;
        });
      }
    }

    this.saveLocalCart(cart);
    this.updateQuantity();
    return of({ ok: true });
  }

  cleanCart() {
    if (this.securityService.isLoggedIn()) {
      return this.http.delete(this.apiUrl + '/ClearCart').pipe(
        tap(() => {
          this.updateQuantity();
        }),
      );
    }

    localStorage.removeItem(this.storageKey);
    this.updateQuantity();
    return of({ ok: true });
  }

  syncLocalCartToServer() {
    const localCart = this.getLocalcart().items;

    if (!localCart || localCart.length === 0) {
      this.updateQuantity();
      return of({ ok: true });
    }

    const itemsToSync = localCart.map((item: CartItemResponse) => ({
      productId: item.productId ?? item.productoId ?? '',
      quantity: Number(item.quantity ?? item.amount ?? 0),
    }));

    return this.http.post(this.apiUrl + '/SyncCart', itemsToSync).pipe(
      tap(() => {
        localStorage.removeItem(this.storageKey);
        this.updateQuantity();
      }),
    );
  }
}
