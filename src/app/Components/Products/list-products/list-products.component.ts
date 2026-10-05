import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ProductDTO } from '../../../Models/ProductDTO/Product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../Services/product.service';
import { CategoryService } from '../../../Services/category.service';
import { CategoryDTO } from '../../../Models/CategoryDTO/Category';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-list-products',
  imports: [UpperCasePipe, CurrencyPipe],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent {

  private router = inject(Router);
  private ProductService = inject(ProductService);

  @Input({ required: true })
  productList: ProductDTO[] = [];


  @Output()
  deleteProduct = new EventEmitter<string>();
  

  category?: CategoryDTO;
  loading = false;
  error: string | null = null;



  delete(id: string) {
    this.deleteProduct.emit(id);
  }









}






