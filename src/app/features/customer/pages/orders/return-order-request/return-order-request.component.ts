import {
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { OrderService } from '../../../services/order/order.service';

interface ReturnReason {
  value: string;
  label: string;
  id: string;
}

@Component({
  selector: 'app-return-order-request',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './return-order-request.component.html',
  styleUrl: './return-order-request.component.css',
})
export class ReturnOrderRequestComponent {
  // Inject
  private alertService = inject(AlertService);
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);

  // Input
  readonly isVisible = input(false);
  readonly orderId = input(0);

  // Output
  readonly closeModalEmitter = output<void>();
  readonly returnRequestSuccessfulEmitter = output<void>();

  // state
  readonly selectedReason = signal('');
  readonly note = signal('');
  readonly isSubmitting = signal(false);

  readonly reasons: ReturnReason[] = [
    { id: 'radioWrongItem', value: 'I bought the wrong items', label: 'I bought the wrong items' },
    { id: 'radioReceivedWrong', value: 'I received the wrong items', label: 'I received the wrong items' },
    { id: 'radioDamaged', value: 'The product was damaged/defective', label: 'The product was damaged/defective' },
    { id: 'radioLate', value: 'The product arrived too late', label: 'The product arrived too late' },
  ];

  // API
  sendReturnRequest() {
    const reason = this.selectedReason();

    if (!reason) {
      this.alertService.showAndCloseAlertAfterXSecond(
        'Please choose reason before send return request.', 'red', 3000
      );
      return;
    }

    this.isSubmitting.set(true);

    this.orderService
      .sendOrderReturnRequest(this.orderId(), reason, this.note())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.resetForm();
          this.returnRequestSuccessfulEmitter.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  onReasonChange(reason: string) {
    this.selectedReason.set(reason);
  }

  closeModal() {
    this.resetForm();
    this.closeModalEmitter.emit();
  }

  private resetForm() {
    this.selectedReason.set('');
    this.note.set('');
  }
}