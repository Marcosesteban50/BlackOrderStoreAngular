import { inject, Injectable } from '@angular/core';
import { ICrudService } from '../Interfaces/iCrudService';
import { ProductDTO, ProductCreationDTO } from '../Models/ProductDTO/Product';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { CategoryDTO } from '../Models/CategoryDTO/Category';

@Injectable({
  providedIn: 'root'
})
export class ProductService implements ICrudService<ProductDTO, ProductCreationDTO> {

  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/Product'


  constructor() { }


  get(): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.urlBase}/GetProducts`)

  }
  getById(id: string): Observable<ProductDTO> {
    throw new Error('Method not implemented.');
  }

  filter(x: any): Observable<HttpResponse<ProductDTO[]>> {
    const params = new HttpParams({ fromObject: x });

    return this.http.get<ProductDTO[]>(`${this.urlBase}/Filter`, { params, observe: 'response' });
  }

  update(id: string, model: ProductCreationDTO): Observable<any> {
    const formData = this.buildFormData(model);
    return this.http.put(`${this.urlBase}/${id}`, formData);
  }
  create(model: ProductCreationDTO): Observable<any> {
    const formData = this.buildFormData(model);
    return this.http.post(`${this.urlBase}/Add-Product`, formData);
  }
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.urlBase}/${id}`)
  }




  // We use FormData for file/images
  private buildFormData(product: ProductCreationDTO): FormData {

    const formData = new FormData();
    formData.append('name', product.name);
    if (product.description) formData.append('description', product.description);
    formData.append('price', product.price.toString());

    // NEW IMAGES
    if (product.images) {
      product.images.forEach(image => {
        formData.append('images', image);
      });
    }

    // OLD IMAGES THE USER WANTS TO DELETE
    if (product.deletedImages) {
      product.deletedImages.forEach(url => {
        formData.append('deletedImages', url);
      });
    }

    if (product.categoryId) formData.append('categoryId', product.categoryId);


    console.log(product.images);

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    return formData;
  }
}
