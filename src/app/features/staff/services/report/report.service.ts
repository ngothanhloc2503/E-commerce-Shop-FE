import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../../../constants';
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
    return this.httpClient.get(BASE_URL + `/sales-by-${groupBy}/${period}`);
  }

  getReportDataByDateRange(groupBy: string, fromDate: string, toDate: string): Observable<any> {
    return this.httpClient.get(BASE_URL + `/sales-by-${groupBy}/${fromDate}/${toDate}`);
  }
}
