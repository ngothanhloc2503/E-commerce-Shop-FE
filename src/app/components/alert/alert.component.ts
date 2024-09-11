import { Component, Input } from '@angular/core';
import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  @Input() color: string = 'red'; //blue, green, yellow
  @Input() message: string = 'An unexpected error occurred. Please try again later.';

  constructor(public alertService: AlertService) { }

  get bgColor(): string {
    return `text-${this.color}-800 bg-${this.color}-50 dark:text-${this.color}-400`;
  }
  
  get buttonBgColor(): string {
    return `bg-${this.color}-50 text-${this.color}-500 focus:ring-${this.color}-400 hover:bg-${this.color}-200 dark:text-${this.color}-400`;
  }
}
