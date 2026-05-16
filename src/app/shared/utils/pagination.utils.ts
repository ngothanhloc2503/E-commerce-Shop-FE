import { computed, Signal } from '@angular/core';

export interface PaginationComputedSignals {
  startCount: Signal<number>;
  endCount: Signal<number>;
  pageNumbers: Signal<number[]>;
}

export function getPaginationSignals(
  pageNum: Signal<number>,
  pageSize: Signal<number>,
  totalItems: Signal<number>,
  totalPages: Signal<number>
): PaginationComputedSignals {
  return {
    startCount: computed(() => {
      if (totalItems() === 0) return 0;
      return (pageNum() - 1) * pageSize() + 1;
    }),
    
    endCount: computed(() => {
      if (pageSize() < 1) return totalItems(); // Get All
      return (pageNum() * pageSize() > totalItems())
        ? totalItems()
        : pageNum() * pageSize();
    }),
    
    pageNumbers: computed(() => {
      const total = totalPages();
      return Array.from({ length: total }, (_, i) => i + 1);
    })
  };
}