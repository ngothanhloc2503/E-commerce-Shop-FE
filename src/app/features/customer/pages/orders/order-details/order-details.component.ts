import { Component, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

type TabName = 'overview' | 'products' | 'shipping' | 'track';

interface FieldRow {
  label: string;
  value: any;
  isDate?: boolean;
}

interface TabDef {
  name: TabName;
  label: string;
}

@Component({
    selector: 'app-order-details',
    imports: [DatePipe],
    templateUrl: './order-details.component.html',
    styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  // Input
  readonly isVisible = input(false);
  readonly order = input<any>({});

  // Output
  readonly closeModalEmitter = output<void>();

  // State
  readonly activeTab = signal<TabName>('overview');

  readonly tabs: TabDef[] = [
    { name: 'overview', label: 'Overview' },
    { name: 'products', label: 'Products' },
    { name: 'shipping', label: 'Shipping' },
    { name: 'track', label: 'Track' },
  ];

  readonly overviewFields: FieldRow[] = [
    { label: 'Order ID', value: 'id' },
    { label: 'Subtotal', value: 'subtotal' },
    { label: 'Shipping Cost', value: 'shippingCost' },
    { label: 'Tax', value: 'tax' },
    { label: 'Total', value: 'total' },
    { label: 'Payment Method', value: 'paymentMethod' },
    { label: 'Status', value: 'status' },
  ];

  readonly shippingFields: FieldRow[] = [
    { label: 'Order Time', value: 'orderTime', isDate: true },
    { label: 'Deliver Days', value: 'deliverDays' },
    { label: 'Expected Deliver Date', value: 'deliverDate', isDate: true },
    { label: 'First Name', value: 'firstName' },
    { label: 'Last Name', value: 'lastName' },
    { label: 'Phone Number', value: 'phoneNumber' },
    { label: 'Address Line 1', value: 'addressLine1' },
    { label: 'Address Line 2', value: 'addressLine2' },
    { label: 'City', value: 'city' },
    { label: 'Country', value: 'country' },
    { label: 'State', value: 'state' },
    { label: 'Postal Code', value: 'postalCode' },
  ];

  // Action
  showTab(tabName: TabName) {
    this.activeTab.set(tabName);
  }

  closeModal() {
    this.closeModalEmitter.emit();
  }

  // Helper
  getFieldValue(fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], this.order());
  }
}