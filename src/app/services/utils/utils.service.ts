import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { AlertService } from '../alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private alertService: AlertService,
  ) { }

  handleError(err: any) {
    let message: string;
    switch (err.status) {
      case 400:
        message = 'Bad request. Please check your input.';
        break;
      case 401:
        message = 'You are not authorized to perform this action. Please log in.';
        break;
      case 403:
        message = 'Access denied. You do not have permission to access this resource.';
        break;
      case 404:
        message = err.error;
        break;
      case 409:
        message = err.error;
        break;
      case 500:
        message = 'An internal server error occurred. Please try again later.';
        break;
      default:
        message = 'An unexpected error occurred. Please try again.';
        break;
    }

    this.alertService.showAndCloseAlertAfterXSecond(message, "red", 3000);
  }

  roundNumber(num: number): number {
    return Math.round(num * 100) / 100;
  }

  createPagingAndSortingParams(pageNum: number, pageSize: number, sortField: string, sortDir: string, keyword: string): HttpParams {
    let parameters: HttpParams = new HttpParams();
    parameters = parameters.append('pageNum', pageNum);
    parameters = parameters.append('pageSize', pageSize);
    parameters = parameters.append('sortField', sortField);
    parameters = parameters.append('sortDir', sortDir);
    parameters = parameters.append('keyword', keyword);

    return parameters;
  }

  createAuthorizationHeader(): HttpHeaders {
    return new HttpHeaders().set(
      'Authorization', 'Bearer ' + StorageService.getToken()
    );
  }
}
