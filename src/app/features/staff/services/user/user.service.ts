import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../constants';
import { HttpUtilService } from '../../../../core/services/http-util/http-util.service';

const BASE_URL = API_URL + '/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private httpClient: HttpClient,
    private httpUtil: HttpUtilService
  ) { }

  getAllRoles(): Observable<any> {
    return this.httpClient.get(API_URL + '/roles')
  }

  getUsersByPage(pageNum: number, pageSize: number, keyword: string, sortField: string, sortDir: string): Observable<any> {
    let parameters = this.httpUtil.createPagingParams(pageNum, pageSize, sortField, sortDir, keyword);
    
    return this.httpClient.get(BASE_URL, { params: parameters })
  }

  changeEnabledStatus(id: number, status: boolean): Observable<any> {
    return this.httpClient.patch(BASE_URL + `/${id}/enabled`, { status });
  }

  saveUser(user: any, userPhoto: File): Observable<any> {
    const formData = new FormData();
    formData.append('user', new Blob([JSON.stringify(user)] , {type: 'application/json'}));
    formData.append('filePhoto', userPhoto)
    
    return this.httpClient.post(BASE_URL, formData)
  }

  deleteUser(userID: number): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/${userID}`, {
    })
  }

  exportToCsv(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/csv', {
      responseType: 'blob'
    });
  }

  exportToExcel(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/excel', {
      responseType: 'blob'
    });
  }

  exportToPdf(): Observable<any> {
    return this.httpClient.get(BASE_URL + '/export/pdf', {
      responseType: 'blob'
    });
  }

  isEmailUnique(id: any, email: any): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append("id", id);
    parameters = parameters.append("email", email);

    return this.httpClient.get(BASE_URL + '/email-unique', {
      params: parameters
    })
  }

  getUserById(userId: any): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${userId}`);
  }
}
