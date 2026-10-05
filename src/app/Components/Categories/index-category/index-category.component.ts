import { Component, inject, OnInit } from '@angular/core';
import { CategoryService } from '../../../Services/category.service';
import { CategoryDTO } from '../../../Models/CategoryDTO/Category';
import { ListCategoryComponent } from '../list-category/list-category.component';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-index',
  imports: [ListCategoryComponent, RouterLink],
  templateUrl: './index-category.component.html',
  styleUrl: './index-category.component.css'
})
export class IndexCategoryComponent implements OnInit {



  ngOnInit(): void {
    this.loadingCategories();
  }


  categoryService = inject(CategoryService);
  categories!: CategoryDTO[];


  loadingCategories() {
    this.categoryService.get().subscribe(categoriesX => {
      this.categories = categoriesX;
    })
  }


  deleteCategory(id: string) {
    this.categoryService.delete(id).subscribe({
      next: () => this.loadingCategories(),
      error: (err) => console.log('Error at deleting', err)
    });
  }


}
