import { Component, input, output, TemplateRef, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modal',
    imports: [CommonModule],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() title: string = 'Modal title';
  @Input() contentTemplate: TemplateRef<any> | null = null;

  closeEvent = output<void>();
  submitEvent = output<void>();

  close(): void {
    this.closeEvent.emit();
  }

  submit(): void {
    this.submitEvent.emit();
  }
}