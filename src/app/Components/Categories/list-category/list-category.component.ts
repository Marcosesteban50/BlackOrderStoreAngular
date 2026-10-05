import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CategoryDTO } from '../../../Models/CategoryDTO/Category';
import { Router, RouterLink } from '@angular/router';
import { ProductDTO } from '../../../Models/ProductDTO/Product';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';



@Component({
  selector: 'app-list-category',
  imports: [RouterLink, ReactiveFormsModule, NgClass],
  templateUrl: './list-category.component.html',
  styleUrl: './list-category.component.css'
})
export class ListCategoryComponent {

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);



  @Input({ required: true })
  categoryList: CategoryDTO[] = [];

  product?: ProductDTO;


  loading = false;
  error: string | null = null;

  @Output()
  deleteCategory = new EventEmitter<string>();



  searchForm = this.formBuilder.group({
    categoryId: ['']
  });

  delete(id: string) {
    this.deleteCategory.emit(id);
  }






  onCategoryChange() {
    const categoryId = this.searchForm.controls.categoryId.value;


    if (!categoryId) {
      this.router.navigate(['/categories'])
    }


    this.router.navigate(['products/filter'], {
      queryParams: {
        categoryId: categoryId || null
      }
    });
  }


  // categories.component.ts
  getCategoryIcon(name: string): string {
    const icons: Record<string, string> = {
      'Mythic+ Boosting': 'bi-shield-fill-check',
      'Raid Carries': 'bi-fire',
      'PvP Boosting': 'bi-lightning-charge-fill',
      'Gold Farming': 'bi-coin',
      'Power Leveling': 'bi-arrow-up-circle-fill',
      'Mount Farming': 'bi-gem',
      'Gear Boosting': 'bi-shield-shaded',
      'Achievement Runs': 'bi-trophy-fill',
      'Profession Leveling': 'bi-hammer',
      'Account Services': 'bi-person-badge-fill',
      'Classic WoW Services': 'bi-hourglass-split',
      'Collectibles & Transmog': 'bi-stars'
    };
    return icons[name] ?? 'bi-lightning-charge-fill';
  }

}
