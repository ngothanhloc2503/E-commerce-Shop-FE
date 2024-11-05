import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilsService } from '../../utils/utils.service';
import { API_URL } from '../../../constants';
import { Observable } from 'rxjs';

const BASE_URL = API_URL + '/staff/reports';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getReportDataByPeriod(groupBy: string, period: string): Observable<any> {
    return this.httpClient.get(BASE_URL + `/sales-by-${groupBy}/${period}`, { 
      headers: this.utilsService.createAuthorizationHeader()
    });
  }

  getReportDataByDateRange(groupBy: string, fromDate: string, toDate: string): Observable<any> {
    return this.httpClient.get(BASE_URL + `/sales-by-${groupBy}/${fromDate}/${toDate}`, { 
      headers: this.utilsService.createAuthorizationHeader()
    });
  }
}
