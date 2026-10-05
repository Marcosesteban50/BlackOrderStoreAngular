import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ICrudService } from '../Interfaces/iCrudService';
import { CategoryDTO, CreateCategoryDTO } from '../Models/CategoryDTO/Category';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService implements ICrudService<CategoryDTO, CreateCategoryDTO> {

  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/Category'


  constructor() { }

  public get(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(`${this.urlBase}/GetCategories`)
  }
  getById(id: string): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(`${this.urlBase}/${id}`);
  }
  update(id: string, model: CreateCategoryDTO): Observable<any> {
    const formData = this.buildFormData(model);
    return this.http.put(`${this.urlBase}/${id}`, formData);
  }
  create(model: CreateCategoryDTO): Observable<any> {
    const formData = this.buildFormData(model);
    return this.http.post(`${this.urlBase}/Add-Category`, formData)
  }
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.urlBase}/${id}`)
  }



  // We use FormData for file/images
  private buildFormData(category: CreateCategoryDTO): FormData {

    const formData = new FormData();
    formData.append('name', category.name);



    // NEW IMAGES
    if (category.images) {
      category.images.forEach(image => {
        formData.append('images', image);
      });
    }

    // OLD IMAGES THE USER WANTS TO DELETE
    // if (product.deletedImages) {
    //   product.deletedImages.forEach(url => {
    //     formData.append('deletedImages', url);
    //   });
    // }




    console.log(category.images);

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    return formData;
  }
}
