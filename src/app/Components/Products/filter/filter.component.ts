import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FilterProducts, ProductDTO } from '../../../Models/ProductDTO/Product';
import { ProductService } from '../../../Services/product.service';
import { Location } from '@angular/common';
import { ListProductsComponent } from '../list-products/list-products.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';



@Component({
  selector: 'app-filter',
  imports: [ListProductsComponent, MatButtonModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatCheckboxModule,],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent implements OnInit {


  ngOnInit(): void {
    this.GetURLValue();
  }




  private location = inject(Location);
  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);


  form = this.formBuilder.group({
    name: [''],
    available: [true],
    categoryId: [''],
    highPrice: [false],
    lowPrice: [false]
  })



  UrlParameters(value: FilterProducts) {

    let queryStrings = [];

    if (value.name) {
      queryStrings.push(`name=${encodeURIComponent(value.name)}`);
    }

    if (value.categoryId) {
      queryStrings.push(`categoryId=${encodeURIComponent(value.categoryId)}`);
    }

    if (value.lowPrice) {
      queryStrings.push(`lowPrice=${value.lowPrice}`);
    }

    if (value.highPrice) {
      queryStrings.push(`highPrice=${value.highPrice}`);
    }

    this.location.replaceState(
      'products/filter',
      queryStrings.join('&')
    );
  }


  GetURLValue() {
    this.activatedRoute.queryParamMap.subscribe((params: any) => {

      //reseteamos para cuando demos click an opcion todos se muestren todos
      this.form.reset({
        name: '',
        categoryId: '',
        lowPrice: false,
        highPrice: false
      }, { emitEvent: false });

      const filterObj: Partial<FilterProducts> = {};

      const name = params.get('name');
      const categoryId = params.get('categoryId');
      const lowPrice = params.get('lowPrice');
      const highPrice = params.get('highPrice');
      const available = params.get('available');

      if (name) filterObj.name = name;
      if (categoryId) filterObj.categoryId = categoryId;
      if (lowPrice !== null) filterObj.lowPrice = lowPrice === 'true';
      if (highPrice !== null) filterObj.highPrice = highPrice === 'true';
      if (available !== null) filterObj.available = available === 'true';


      this.form.patchValue(filterObj);

      console.log('Form -> :', this.form.value);


      this.getProducts(this.form.value as FilterProducts);
    })
  }



  @Output()
  ProductsFiltered = new EventEmitter<ProductDTO[]>();

  products!: ProductDTO[];
  productService = inject(ProductService);

  error: string | null = null;




  getProducts(value: FilterProducts) {
    // Limpiamos los parámetros vacíos o nulos antes de llamar al servicio
    const cleanedFilter = this.cleanParams(value);

    this.productService.filter(cleanedFilter).subscribe({
      next: (rsp) => {
        this.products = rsp.body ?? [];
        this.ProductsFiltered.emit(this.products);
      },
      error: (err) => {
        this.error = 'Ocurrió un error al cargar los productos.';
        console.error(err);
      }
    });
  }

  private cleanParams(obj: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (val !== null && val !== undefined && val !== '') {
        clean[key] = val;
      }
    });
    return clean;
  }

}
