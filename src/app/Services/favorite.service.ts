import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Favorite } from '../Models/FavoriteDTO/Favorite';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/Favorite';

  get(): Observable<Favorite> {
    return this.http.get<Favorite>(this.urlBase);
  }

  add(productId: string): Observable<void> {
    return this.http.post<void>(`${this.urlBase}/${productId}`, {});
  }

  remove(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${productId}`);
  }
}
