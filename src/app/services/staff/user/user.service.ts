import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../../storage/storage.service';
import { API_URL } from '../../../constants';
import { UtilsService } from '../../utils/utils.service';

const BASE_URL = API_URL + '/staff/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
  ) { }

  getAllRoles(): Observable<any> {
    return this.httpClient.get(API_URL + '/staff/roles', {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  getUsersByPage(pageNum: number, pageSize: number, keyword: string, sortField: string, sortDir: string): Observable<any> {
    let parameters = this.utilsService.createPagingAndSortingParams(pageNum, pageSize, sortField, sortDir, keyword);
    
    return this.httpClient.get(BASE_URL, {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  changeEnabledStatus(id: number, status: boolean): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${id}/enabled/${status}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  saveUser(user: any, userPhoto: File): Observable<any> {
    const formData = new FormData();
    formData.append('user', new Blob([JSON.stringify(user)] , {type: 'application/json'}));
    formData.append('filePhoto', userPhoto)
    // let parameters: HttpParams = new HttpParams();
    // parameters = parameters.append("filePhoto", userPhoto);
    return this.httpClient.post(BASE_URL + '/save', formData, {
      headers: this.utilsService.createAuthorizationHeader(),
      // params: parameters
    })
  }

  deleteUser(userID: number): Observable<any> {
    return this.httpClient.delete(BASE_URL + `/delete/${userID}`, {
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }

  isEmailUnique(id: any, email: any): Observable<any> {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append("id", id);
    parameters = parameters.append("email", email);
    return this.httpClient.get(BASE_URL + '/check-email', {
      headers: this.utilsService.createAuthorizationHeader(),
      params: parameters
    })
  }

  getUserById(userId: any): Observable<any> {
    return this.httpClient.get(BASE_URL + `/${userId}`, { 
      headers: this.utilsService.createAuthorizationHeader(),
    })
  }
}
