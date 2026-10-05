import { Component, inject } from '@angular/core';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { Router } from '@angular/router';
import { CategoryService } from '../../../Services/category.service';
import { CreateCategoryDTO } from '../../../Models/CategoryDTO/Category';

@Component({
  selector: 'app-create-category',
  imports: [CategoryFormComponent],
  templateUrl: './create-category.component.html',
  styleUrl: './create-category.component.css'
})
export class CreateCategoryComponent {

  private router = inject(Router);
  private categoryService = inject(CategoryService);
  errors: string[] = [];



  SaveChanges(category: CreateCategoryDTO) {
    this.categoryService.create(category).subscribe({
      next: () => {
        this.router.navigate(['/categories'])
      },
      error: (err) => {
        this.errors = err;
        console.log(err);
      }
    })
  }

}
