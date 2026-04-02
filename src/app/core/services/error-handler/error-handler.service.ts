import { Injectable } from '@angular/core';
import { AlertService } from '../alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
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
          message = 'You are not authorized. Please log in.';
          break;
        case 403:
          message = 'Access denied.';
          break;
        case 404:
        case 409:
          message = err?.error?.message || err?.error || 'Request error';
          break;
        case 500:
          message = 'Internal server error. Try again later.';
          break;
        default:
          message = 'Unexpected error occurred.';
      }
  
      this.alertService.showAndCloseAlertAfterXSecond(message, "red", 3000);
      return message;
    }
  
}
