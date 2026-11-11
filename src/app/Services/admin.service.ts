import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminDashboard } from '../Models/AdminDTO/Admin';
import { Paged } from '../Models/Common/Paged';
import { ProductDTO } from '../Models/ProductDTO/Product';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/Admin';

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.urlBase}/Dashboard`);
  }

  pendingProducts(page = 1, pageSize = 10): Observable<Paged<ProductDTO>> {
    return this.http.get<Paged<ProductDTO>>(
      `${this.urlBase}/Products/Pending?page=${page}&pageSize=${pageSize}`,
    );
  }

  approveProduct(id: string): Observable<void> {
    return this.http.post<void>(`${this.urlBase}/Products/${id}/Approve`, {});
  }

  rejectProduct(id: string): Observable<void> {
    return this.http.post<void>(`${this.urlBase}/Products/${id}/Reject`, {});
  }
}
