import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../Services/product.service';
import { ProductCreationDTO } from '../../../Models/ProductDTO/Product';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-create-product',
  imports: [ProductFormComponent],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent {

  private router = inject(Router);
  private ProductService = inject(ProductService);
  errors: string[] = [];


  saveChanges(product: ProductCreationDTO) {
    this.ProductService.create(product).subscribe({
      next: () => {
        this.router.navigate(['/services'])
      },
      error: (err) => {
        this.errors = err;
        console.log(err);
      }
    })
  }

}
