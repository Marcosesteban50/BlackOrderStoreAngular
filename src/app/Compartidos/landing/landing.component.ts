import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../Services/product.service';
import { ProductDTO } from '../../Models/ProductDTO/Product';
import { ListProductsComponent } from '../../Components/Products/list-products/list-products.component';

@Component({
  selector: 'app-landing',
  imports: [ListProductsComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {


  ngOnInit(): void {
    this.loadingProducts();
  }


  productService = inject(ProductService);
  products!: ProductDTO[];


  loadingProducts() {
    this.productService.get().subscribe(productsX => {
      this.products = productsX;
    });
  }

}
