import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CategoryDTO, CreateCategoryDTO } from '../../../Models/CategoryDTO/Category';
import { CategoryService } from '../../../Services/category.service';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InputImgComponent } from '../../../Compartidos/input-img/input-img/input-img.component';




@Component({
  selector: 'app-category-form',
  imports: [MatButtonModule, RouterLink, MatFormFieldModule, ReactiveFormsModule, MatInputModule,
    MatSelectModule, InputImgComponent],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent implements OnInit {


  ngOnInit(): void {
    if (this.model !== undefined) {
      const { images, ...formData } = this.model;

      this.form.patchValue(formData);
    }
  }



  @Input()
  model?: CategoryDTO;

  categoryService = inject(CategoryService);

  @Output()
  SubmitForm = new EventEmitter<CreateCategoryDTO>();

  private FormBuilder = inject(FormBuilder);

  form = this.FormBuilder.group({
    name: ['', { validators: [Validators.required] }],
    description: ['', { validators: [Validators.required, Validators.maxLength(500)]}],
    images: new FormControl<File[]>([])

  });




  SelectedFiles(files: File[]) {
    this.form.controls.images.setValue(files);
  }

  SaveChanges() {
    if (!this.form.valid) {
      return;
    }



    const category = this.form.value as CreateCategoryDTO;

    this.SubmitForm.emit(category);
  }

}
