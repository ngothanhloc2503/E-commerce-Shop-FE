import { Injectable } from '@angular/core';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  isShowAlert = false;
  alertMessage = '';
  alertColor = 'red';

  constructor() { }

  showAndCloseAlertAfterXSecond(alertMessage: string, alertColor: string, time: number) {
    this.isShowAlert = false;
    this.alertMessage = alertMessage;
    this.alertColor = alertColor;
    this.isShowAlert = true;
    this.closeAlert(time);
  }
  
  showAlert(alertMessage: string, alertColor: string) {
    this.isShowAlert = false;
    this.alertMessage = alertMessage;
    this.alertColor = alertColor;
    this.isShowAlert = true;
  }

  closeAlert(time: number) {
    timer(time).subscribe(i => {
      this.isShowAlert = false;
    })
  }
}
