import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { OrderService } from '../../../services/order/order.service';

@Component({
  selector: 'app-return-order-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-order-request.component.html',
  styleUrl: './return-order-request.component.css'
})
export class ReturnOrderRequestComponent {
  @Input() isVisible: boolean = false;
  @Input() orderId: number = 0;
  @Output() closeModalEmitter: EventEmitter<boolean> = new EventEmitter();
  @Output() returnRequestSuccessfulEmitter: EventEmitter<boolean> = new EventEmitter();

  reason = '';
  note = '';

  constructor(
    private alertService: AlertService,
    private orderService: OrderService,
  ) {}

  sendReturnRequest() {
    if (this.reason != '') {
      let data = new FormData();
      data.append('id', this.orderId.toString());
      data.append('reason', this.reason);
      data.append('note', this.note);

      this.orderService.sendOrderReturnRequest(this.orderId, this.reason, this.note).subscribe({
        next: (res) => {
          this.isVisible = false;
          this.reason = '';
          this.returnRequestSuccessfulEmitter.emit();
        },
      })
    } else {
      this.alertService.showAndCloseAlertAfterXSecond("Please choose reason before send return request.", "red", 3000);
    }
  }

  onSelectReason(event: Event) {
    const target = event.target as HTMLInputElement;
    this.reason = target.value;
  }

  closeModal() {
    this.isVisible = false;
    this.reason = '';
    this.closeModalEmitter.emit();
  }
}
