import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ProductDTO } from '../../../Models/ProductDTO/Product';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../Services/product.service';
import { CategoryService } from '../../../Services/category.service';
import { CategoryDTO } from '../../../Models/CategoryDTO/Category';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { CartService } from '../../../Services/cart.service';

@Component({
  selector: 'app-list-products',
  imports: [UpperCasePipe, CurrencyPipe],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css',
})
export class ListProductsComponent {
  private router = inject(Router);
  private ProductService = inject(ProductService);
  private cartService = inject(CartService);

  @Input({ required: true })
  productList: ProductDTO[] = [];

  @Output()
  deleteProduct = new EventEmitter<string>();

  category?: CategoryDTO;
  loading = false;
  error: string | null = null;

  delete(id: string) {
    console.log('ID a eliminar:', id);
    this.deleteProduct.emit(id);
  }

  addToCart(product: ProductDTO) {
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
          console.log('Adding to cart:', product);
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
        },
      });
  }
}
