import { Component, input, inject } from '@angular/core';
import { AlertService } from '../../../core/services/alert/alert.service';

type AlertColor = 'red' | 'green' | 'yellow' | 'blue';

@Component({
    selector: 'app-alert',
    imports: [],
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.css'
})
export class AlertComponent {
  color = input<AlertColor>('red');
  message = input<string>('An unexpected error occurred. Please try again later.');

  alertService = inject(AlertService);

  private stylesMap: Record<AlertColor, { wrapper: string, accent: string, button: string }> = {
    red: {
      wrapper: 'text-red-800 bg-red-50 dark:text-red-400',
      accent: 'bg-red-800',
      button: 'bg-red-50 text-red-500 focus:ring-red-400 hover:bg-red-200 dark:text-red-400'
    },
    green: {
      wrapper: 'text-green-800 bg-green-50 dark:text-green-400',
      accent: 'bg-green-800',
      button: 'bg-green-50 text-green-500 focus:ring-green-400 hover:bg-green-200 dark:text-green-400'
    },
    yellow: {
      wrapper: 'text-yellow-800 bg-yellow-50 dark:text-yellow-400',
      accent: 'bg-yellow-800',
      button: 'bg-yellow-50 text-yellow-500 focus:ring-yellow-400 hover:bg-yellow-200 dark:text-yellow-400'
    },
    blue: {
      wrapper: 'text-blue-800 bg-blue-50 dark:text-blue-400',
      accent: 'bg-blue-800',
      button: 'bg-blue-50 text-blue-500 focus:ring-blue-400 hover:bg-blue-200 dark:text-blue-400'
    }
  };

  get wrapperClasses(): string {
    return this.stylesMap[this.color()]?.wrapper || this.stylesMap.red.wrapper;
  }

  get accentClasses(): string {
    return this.stylesMap[this.color()]?.accent || this.stylesMap.red.accent;
  }

  get buttonClasses(): string {
    return this.stylesMap[this.color()]?.button || this.stylesMap.red.button;
  }

  close() {
    this.alertService.closeAlert();
  }
}