import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryDTO, CreateCategoryDTO } from '../../../Models/CategoryDTO/Category';
import { CategoryService } from '../../../Services/category.service';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-edit-category',
  imports: [CategoryFormComponent],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.css'
})
export class EditCategoryComponent implements OnInit {



  ngOnInit(): void {

    this.id = this.route.snapshot.paramMap.get('id')!;

    this.GetId(this.id);

  }



  @Input({ required: true })
  id!: string;

  private router = inject(Router);
  category?: CategoryDTO;
  categoryService = inject(CategoryService);
  route = inject(ActivatedRoute);
  errors: string[] = [];



  SaveChanges(category: CreateCategoryDTO) {
    this.categoryService.update(this.id, category).subscribe({
      next: () => {
        console.log('Updating category ->', category);
        this.router.navigate(['/categories'])
      },
      error: (err) => {
        this.errors = err;
        console.log('errors ->', err);
      }
    })
  }


  GetId(id: string) {
    this.categoryService.getById(id).subscribe(categoryX => {
      this.category = categoryX
    });
  }

}
