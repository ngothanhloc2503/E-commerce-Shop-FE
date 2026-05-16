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
    if (err?.status === 401) {
      return;
    }

    let message = this.extractMessage(err);
    switch (err.status) {
      case 400:
        message = 'Bad request. Please check your input.';
        break;
      case 401:
      case 403:
      case 500:
        break;
      case 404:
      case 409:
        message = err?.error?.message || err?.error || 'Request error';
        break;
      default:
        message = 'Unexpected error occurred.';
    }

    this.alertService.showAndCloseAlertAfterXSecond(message, "red", 3000);
    return message;
  }

  private extractMessage(err: any): string {
    if (!err) return '';

    if (typeof err.error === 'string') {
      return err.error;
    }

    if (err.error?.message) {
      return err.error.message;
    }

    if (err.message) {
      return err.message;
    }

    return '';
  }
}
