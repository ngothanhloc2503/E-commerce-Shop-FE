import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../../../environment';
import { Observable } from 'rxjs';

const BASE_URL = API_URL + '/reports';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getReportDataByPeriod(groupBy: string, period: string): Observable<any> {
    const params = new HttpParams()
      .set('groupBy', groupBy)
      .set('period', period);

    return this.httpClient.get(`${BASE_URL}/period`, { params });
  }

  getReportDataByDateRange(groupBy: string, startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('groupBy', groupBy)
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.httpClient.get(`${BASE_URL}/range`, { params });
  }
}
