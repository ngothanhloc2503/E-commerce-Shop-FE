import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthStateService } from '../../../../core/services/auth-state/auth-state.service';
import { API_URL, BASE_URL } from '../../../../core/constants/app.constants';

const URL = API_URL + '/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private authState: AuthStateService
  ) { }

  resetPassword(token: any, password: any): Observable<any> {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('password', password);
    return this.http.post(`${URL}/reset-password`, formData);
  }

  forgotPassword(email: any): Observable<any> {
    return this.http.post(URL + '/forgot-password', email);
  }

  verifyAccount(code: string): Observable<any> {
    let parameters = new HttpParams;
    parameters = parameters.append('code', code);
    return this.http.get(`${URL}/verify`, {
      params: parameters,
    });
  }

  signUp(registerData: any): Observable<any> {
    return this.http.post<any>(`${URL}/register`, registerData);
  }

  getInfoAfterSignInWithOauth2(token: any): Observable<any> {
    let parameters = new HttpParams();
    parameters = parameters.append("token", "Bearer " + token);
    return this.http.get(`${URL}/login-oauth2`, {
      params: parameters
    }).pipe(
      map((res: any) => {
        this.handleSaveDateToStorage(res.data);
      })
    );
  }

  signIn(userData: any): Observable<any> {
    return this.http.post<any>(`${URL}/login`, userData).pipe(
      map((res) => {
        this.handleSaveDateToStorage(res.data);
      })
    );
  }

  handleSaveDateToStorage(res: any): boolean {
    if (res.accessToken != null) {
      const user = {
        email: res.email,
        fullName: res.fullName,
        image: res.imagePath,
        roles: res.roles
      }
      this.authState.login(res.accessToken, user, res.expiresIn);
      return true;
    }
    return false;
  }

  signInWithGoogle() {
    window.location.href = BASE_URL + '/oauth2/authorization/google';
  }

  // signInWithFacebook() {
  //   window.location.href = BASE_URL + '/oauth2/authorization/facebook';
  // }
}
