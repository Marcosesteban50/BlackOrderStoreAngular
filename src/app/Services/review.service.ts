import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductReviews, Review } from '../Models/ReviewDTO/Review';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/Review';

  getByProduct(productId: string): Observable<ProductReviews> {
    return this.http.get<ProductReviews>(
      `${this.urlBase}/product/${productId}`,
    );
  }

  create(productId: string, rating: number, comment: string): Observable<Review> {
    return this.http.post<Review>(`${this.urlBase}/product/${productId}`, {
      rating,
      comment,
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
