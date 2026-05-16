import { Injectable, signal } from '@angular/core';

type AlertColor = 'red' | 'green' | 'yellow' | 'blue';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  isShowAlert = signal<boolean>(false);
  alertMessage = signal<string>('');
  alertColor = signal<AlertColor>('red');

  private timeoutId: any = null;

  showAlert(alertMessage: string, alertColor: AlertColor) {
    this.clearPendingAlert();
    
    this.alertMessage.set(alertMessage);
    this.alertColor.set(alertColor);
    this.isShowAlert.set(true);
  }
  
  showAndCloseAlertAfterXSecond(alertMessage: string, alertColor: AlertColor, time: number) {
    this.showAlert(alertMessage, alertColor);
    this.closeAlert(time);
  }

  closeAlert(time?: number) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (time) {
      this.timeoutId = setTimeout(() => {
        this.isShowAlert.set(false);
      }, time);
    } else {
      this.isShowAlert.set(false);
    }
  }

  private clearPendingAlert() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
