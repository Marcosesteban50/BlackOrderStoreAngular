import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../../Services/product.service';
import { ProductDTO } from '../../../Models/ProductDTO/Product';
import { ListProductsComponent } from '../list-products/list-products.component';

@Component({
  selector: 'app-index-product',
  imports: [ListProductsComponent],
  templateUrl: './index-product.component.html',
  styleUrl: './index-product.component.css'
})
export class IndexProductComponent implements OnInit {


  ngOnInit(): void {
    this.loadingProducts();
  }



  productService = inject(ProductService);
  products!: ProductDTO[];



  loadingProducts() {
    this.productService.get().subscribe(productX => {
      this.products = productX;
    });
  }


  deleteProduct(id: string) {
    this.productService.delete(id).subscribe({
      next: () => this.loadingProducts(),
      error: (err) => console.log('Error at deleting', err)
    })
  }

}
