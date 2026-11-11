import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Guide,
  GuideCategory,
  GuideFilter,
  GuideSummary,
  PagedResult,
} from '../Models/GuideDTO/Guide';

@Injectable({
  providedIn: 'root',
})
export class GuideService {
  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/Guide';

  getGuides(filter: GuideFilter): Observable<PagedResult<GuideSummary>> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 9);

    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.category) {
      params = params.set('category', filter.category);
    }
    if (filter.level) {
      params = params.set('level', filter.level);
    }

    return this.http.get<PagedResult<GuideSummary>>(this.urlBase, { params });
  }

  getBySlug(slug: string): Observable<Guide> {
    return this.http.get<Guide>(`${this.urlBase}/${encodeURIComponent(slug)}`);
  }

  getCategories(): Observable<GuideCategory[]> {
    return this.http.get<GuideCategory[]>(`${this.urlBase}/categories`);
  }

  getManaged(filter: GuideFilter): Observable<PagedResult<GuideSummary>> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 10);

    if (filter.search) {
      params = params.set('search', filter.search);
    }

    return this.http.get<PagedResult<GuideSummary>>(`${this.urlBase}/manage`, {
      params,
    });
  }

  getManagedById(id: string): Observable<Guide> {
    return this.http.get<Guide>(`${this.urlBase}/manage/${id}`);
  }

  create(model: FormData): Observable<Guide> {
    return this.http.post<Guide>(this.urlBase, model);
  }

  update(id: string, model: FormData): Observable<Guide> {
    return this.http.put<Guide>(`${this.urlBase}/${id}`, model);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
