import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../Services/product.service';
import { ProductDTO } from '../../Models/ProductDTO/Product';
import { ListProductsComponent } from '../../Components/Products/list-products/list-products.component';
import { CategoryService } from '../../Services/category.service';
import { CategoryDTO } from '../../Models/CategoryDTO/Category';
import { ListCategoryComponent } from '../../Components/Categories/list-category/list-category.component';

@Component({
  selector: 'app-landing',
  imports: [ListCategoryComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {


  ngOnInit(): void {
    this.loadingcategories();
  }


  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  products!: ProductDTO[];
  categories!:CategoryDTO[];


  loadingcategories() {
    this.categoryService.get().subscribe(categoriesBackEnd => {
      this.categories = categoriesBackEnd;
    });
  }


  

  deleteCategory(id: string) {
    // console.log('Father - ID recibido:', id);
    this.categoryService.delete(id).subscribe({
      next: () => {
        console.log('Category Deleted:', id);
        this.loadingcategories()
      },
      error: (err) => console.log('Error at deleting', err)
    })
  }

}
