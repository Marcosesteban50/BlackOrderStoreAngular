import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ProductCreationDTO, ProductDTO } from '../../../Models/ProductDTO/Product';
import { ProductService } from '../../../Services/product.service';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryDTO } from '../../../Models/CategoryDTO/Category';
import { CategoryService } from '../../../Services/category.service';
import { InputImgComponent } from '../../../Compartidos/input-img/input-img/input-img.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-product-form',
  imports: [RouterLink,ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, InputImgComponent,],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {


  ngOnInit(): void {
    this.Categories();
  }


  @Input()
  model?: ProductDTO;


  categoryDTO: CategoryDTO[] = [];
  categoryService = inject(CategoryService);
  productService = inject(ProductService);

  @Output()
  SubmitForm = new EventEmitter<ProductCreationDTO>();


  // deletedImages:string[] = []';
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', { validators: [Validators.required] }],
    description: ['', { validators: [Validators.required, Validators.maxLength(50)] }],
    price: [0, { validators: [Validators.required] }],
    images: new FormControl<File[]>([]),
    categoryId: ['', [Validators.required]]


  });



  Categories() {
    this.categoryService.get().subscribe({
      next: (cats) => (this.categoryDTO = cats),
      error: (err) => console.log('Error', err)
    });
  }

  SelectedFiles(files: File[]) {
    this.form.controls.images.setValue(files);
  }

  saveChanges() {
    if (!this.form.valid) {
      return;
    }

    const product = this.form.value as ProductCreationDTO;

    // product.deletedImages = this.deletedImages;

    console.log("Data", product);

    this.SubmitForm.emit(product);

  }

  // onDeleteExistingImage(url: string) {
  //   this.deletedImages.push(url);
  // }


  //   imagenActualEliminada(url: string) {

  //   this.imagenesEliminadas.push(url);

  //   console.log(
  //     'Imágenes existentes a eliminar:',
  //     this.imagenesEliminadas
  //   );
  // }




}
