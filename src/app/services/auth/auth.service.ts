import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { API_URL } from '../../constants';

const BASE_URL = API_URL + '/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private httpClient: HttpClient,
  ) { }

  resetPassword(token: any, password: any): Observable<any> {
    let data = new FormData();
    data.append("token", token);
    data.append("password", password);
    return this.httpClient.post(BASE_URL + '/reset-password', data);
  }

  forgotPassword(email: any): Observable<any> {
    return this.httpClient.post(BASE_URL + '/forgot-password', email);
  }

  verifyAccount(code: string): Observable<any> {
    let parameters = new HttpParams;
    parameters = parameters.append('code', code);
    return this.httpClient.get(`${BASE_URL}/verify`, {
      params: parameters,
    });
  }

  signUp(registerData: any): Observable<any> {
    return this.httpClient.post<any>(`${BASE_URL}/register`, registerData);
  }

  getInfoAfterSignInWithOauth2(token: any) : Observable<any> {
    let parameters = new HttpParams();
    parameters = parameters.append("token", token);
    return this.httpClient.get(`${BASE_URL}/login-oauth2`, {
      params: parameters
    }).pipe(
      map((res: any) => {
        console.log(res);
        if (res.accessToken != null) {
          const user = {
            email: res.email,
            fullName: res.fullName,
            image: res.imagePath,
            roles: res.roles
          }
          StorageService.saveUserInfoAndToken(user, res.accessToken, res.expireDuration);
          return true;
        }
        return false;
      })
    );
  }

  signIn(userData: any): Observable<any> {
    return this.httpClient.post<any>(`${BASE_URL}/login`, userData).pipe(
      map((res) => {
        if (res.accessToken != null) {
          const user = {
            email: res.email,
            fullName: res.fullName,
            image: res.imagePath,
            roles: res.roles
          }
          StorageService.saveUserInfoAndToken(user, res.accessToken, res.expireDuration);
          return true;
        }
        return false;
      })
    );
  }

  signInWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  signInWithFacebook() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/facebook';
  }

  signOut() {
    StorageService.signOut();
  }
}
