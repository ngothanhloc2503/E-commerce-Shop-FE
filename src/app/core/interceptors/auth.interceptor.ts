import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state/auth-state.service';
import { BASE_URL } from '../constants/app.constants';

const AUTH_URLS = [
  '/api/auth/login',
  '/api/auth/login-oauth2',
  '/api/auth/refresh',
  '/api/auth/logout',
];

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  const authState = inject(AuthStateService);
  const http = inject(HttpClient);

  let clonedReq = req;
  const token = authState.token();

  // attach access token
  if (token) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // attach cookie ONLY for auth APIs
  if (AUTH_URLS.some(url => req.url.includes(url))) {
    clonedReq = clonedReq.clone({
      withCredentials: true
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Ignore if response status is 401 or refresh API
      if ((error.status !== 401 && error.status !== 403) || req.url.includes('/api/auth/refresh')) {
        return throwError(() => error);
      }

      // Refresh -> queue request
      if (isRefreshing) {
        return refreshSubject.pipe(
          filter(token => token != null),
          take(1),
          switchMap(newToken => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          })
        );
      }

      // Refresh
      isRefreshing = true;
      refreshSubject.next(null);

      return http.post<any>(BASE_URL + '/api/auth/refresh', {}, {
        withCredentials: true
      }).pipe(
        switchMap(res => {
          const newToken = res.data.accessToken;
          const expiresIn = res.data.expiresIn;

          // Get old user data
          const currentUser = authState.user();

          if (!currentUser) {
            throw new Error('User missing when refreshing token');
          }

          // Update state
          authState.login(newToken, currentUser, expiresIn);

          isRefreshing = false;
          refreshSubject.next(newToken);

          // Retry request
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });

          return next(retryReq);
        }),
        catchError(err => {
          // Refresh fail -> logout
          isRefreshing = false;
          return http.post(`${BASE_URL}/api/auth/logout`, {}, {
            withCredentials: true
          }).pipe(
            catchError(() => {
              return throwError(() => err);
            }),
            switchMap(() => {
              authState.logout();
              return throwError(() => err);
            })
          );
        })
      );
    })
  );
};
