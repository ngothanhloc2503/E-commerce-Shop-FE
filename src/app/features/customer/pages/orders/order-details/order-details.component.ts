import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  @Input() isVisible: boolean = false;
  @Input() order: any = {};
  @Output() closeModalEmitter: EventEmitter<boolean> = new EventEmitter();

  activeTab = "overview";

  showTab(tabName: string) {
    this.activeTab = tabName;
  }

  closeModal() {
    this.isVisible = false;
    this.closeModalEmitter.emit();
  }
}
