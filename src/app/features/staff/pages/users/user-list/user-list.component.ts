import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../../../../core/services/alert/alert.service';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { downloadBlob } from '../../../../../shared/utils/file-download.util';
import { getPaginationSignals } from '../../../../../shared/utils/pagination.utils';
import { UserService } from '../../../services/user/user.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-user-list',
    imports: [RouterLink, ReactiveFormsModule, PaginationComponent],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  // Inject
  private destroyRef = inject(DestroyRef);
  private userService = inject(UserService);
  private alertService = inject(AlertService);
  private modalService = inject(ModalService);
  private fb = inject(FormBuilder);

  // Signals
  listUsers = signal<any[]>([]);
  pageNum = signal(1);
  pageSize = signal(5);
  sortField = signal('id');
  sortDir = signal<'asc' | 'desc'>('asc');
  totalPages = signal(0);
  totalItems = signal(0);

  // Form
  searchForm: FormGroup = this.fb.group({
    keyword: ['', Validators.required]
  })

  // Computed
  pagination = getPaginationSignals(this.pageNum, this.pageSize, this.totalItems, this.totalPages);

  ngOnInit() {
    this.getUsersByPage();
  }

  // API
  getUsersByPage() {
    const keyword = this.searchForm.value.keyword || '';

    this.userService.getUsersByPage(this.pageNum(), this.pageSize(), keyword, this.sortField(), this.sortDir())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        const data = res.data;
        this.listUsers.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalItems.set(data.totalItems);

        if (data.totalPages < this.pageNum()) {
          this.pageNum.set(data.totalPages);
        }
      });
  }

  // Action
  changeEnabledStatus(id: number, status: boolean) {
    this.userService.changeEnabledStatus(id, !status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.getUsersByPage();
        this.alertService.showAndCloseAlertAfterXSecond(
          `User ${id} has been ${status ? 'disabled' : 'enabled'}`,
          'green',
          3000
        );
      });
  }

  deleteUser(modalTemplate: TemplateRef<any>, userID: number) {
    this.modalService.open(modalTemplate, {
      title: `Confirm delete user ID: ${userID}`
    }).subscribe(res => {
      if (res === 'yes') {
        this.userService.deleteUser(userID)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.getUsersByPage();
            this.alertService.showAndCloseAlertAfterXSecond(
              `User ${userID} deleted`,
              'green',
              3000
            );
          });
      }
    });
  }

  sort(field: string) {
    if (field === this.sortField()) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }

    this.getUsersByPage();
  }

  search() {
    this.getUsersByPage();
  }

  clear() {
    this.searchForm.patchValue({ keyword: '' });

    this.getUsersByPage();
  }

  changePageSize(newPageSize: number) {
    this.pageSize.set(newPageSize);
    this.pageNum.set(1);
    this.getUsersByPage();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    this.pageNum.set(page);
    this.getUsersByPage();
  }

  // export
  exportToCsv() {
    this.userService.exportToCsv()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'text/csv;charset=utf-8' });
          downloadBlob(res, `users_${Date.now()}.csv`);
        },
        error: () => {
          this.alertService.showAndCloseAlertAfterXSecond('Error downloading CSV', 'red', 3000);
        }
      });
  }

  exportToExcel() {
    this.userService.exportToExcel()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'text/csv;charset=utf-8' });
          downloadBlob(res, `users_${Date.now()}.xlsx`);
        },
        error: () => {
          this.alertService.showAndCloseAlertAfterXSecond('Error downloading Excel', 'red', 3000);
        }
      });
  }

  exportToPdf() {
    this.userService.exportToPdf()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'text/csv;charset=utf-8' });
          downloadBlob(res, `users_${Date.now()}.pdf`);
        },
        error: () => {
          this.alertService.showAndCloseAlertAfterXSecond('Error downloading PDF', 'red', 3000);
        }
      });
  }
}
