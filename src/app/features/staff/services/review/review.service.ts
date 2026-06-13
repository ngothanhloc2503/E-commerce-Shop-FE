// review.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reviews`;

  // Admin APIs
  getAdminReviews(page: number, size: number, approved?: boolean | null, sortBy = 'reviewTime', sortDir = 'desc') {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    
    if (approved !== null && approved !== undefined) {
      params = params.set('approved', approved.toString());
    }
    
    return this.http.get(`${this.apiUrl}/admin`, 
      { params }
    );
  }
  
  approveReview(reviewId: number) {
    return this.http.post<any>(`${this.apiUrl}/${reviewId}/approve`, {});
  }

  rejectReview(reviewId: number) {
    return this.http.post<any>(`${this.apiUrl}/${reviewId}/reject`, {});
  }

  respondToReview(reviewId: number, response: string) {
    return this.http.put<any>(`${this.apiUrl}/${reviewId}/respond`, { response });
  }
}