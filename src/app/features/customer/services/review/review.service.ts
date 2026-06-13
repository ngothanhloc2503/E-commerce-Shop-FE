// review.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reviews`;

  // Public APIs
  getReviews(productId: number, page: number, size: number, sortBy = 'reviewTime', sortDir = 'desc') {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<any>(`${this.apiUrl}/product/${productId}`, { params });
  }

  getStatistics(productId: number) {
    return this.http.get<any>(`${this.apiUrl}/product/${productId}/statistics`);
  }

  createReview(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  
}