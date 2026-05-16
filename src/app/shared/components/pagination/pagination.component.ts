import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-pagination',
    imports: [],
    templateUrl: './pagination.component.html',
    styleUrl: './pagination.component.css'
})
export class PaginationComponent {
// Inputs
  pageNum = input.required<number>();
  totalPages = input.required<number>();
  totalItems = input.required<number>();
  startCount = input.required<number>();
  endCount = input.required<number>();
  pageNumbers = input.required<number[]>();
  entityName = input<string>('items');

  // Outputs
  pageChange = output<number>();
  pageSizeChange = output<Event>();
}
