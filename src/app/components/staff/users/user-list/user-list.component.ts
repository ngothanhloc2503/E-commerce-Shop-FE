import { Component, TemplateRef, ViewChild } from '@angular/core';
import { UserService } from '../../../../services/staff/user/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../../../services/modal/modal.service';
import { AlertComponent } from '../../../alert/alert.component';
import { AlertService } from '../../../../services/alert/alert.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilsService } from '../../../../services/utils/utils.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AlertComponent, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  listUsers: any = [];
  pageNum = 1;
  pageSize = 5;
  sortField = 'id';
  sortDir = 'asc';
  totalPages = 0;
  totalItems = 0;

  searchForm!: FormGroup;
  keyword = new FormControl('', [
    Validators.required
  ]);

  constructor(
    public alertService: AlertService,
    private userService: UserService,
    private modalService: ModalService,
    private fb: FormBuilder,
    private utilsService: UtilsService,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      keyword: this.keyword
    });

    this.getUsersByPage();
  }

  sort(field: string) {
    if (field.toLocaleLowerCase() === this.sortField.toLocaleLowerCase()) {
      if (this.sortDir.toLocaleLowerCase() === 'asc') {
        this.sortDir = 'desc';
      } else {
        this.sortDir = 'asc';
      }
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }

    this.getUsersByPage();
  }

  clear() {
    this.searchForm.patchValue({keyword: ''});

    this.getUsersByPage();
  }

  search() {
    this.getUsersByPage();
  }

  exportToCsv() {
    this.userService.exportToCsv().subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'text/csv;charset=utf-8' });
        
        // Create a link element
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'users_' + new Date().toISOString().split('.')[0].replace(/:/g, '-') + '.csv';

        // Append to the DOM and trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up and remove the link
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.alertService.showAndCloseAlertAfterXSecond('Error downloading the file', 'red', 5000);
      }
    });
  }

  exportToExcel() {
    this.userService.exportToExcel().subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Create a link element
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'users_' + new Date().toISOString().split('.')[0].replace(/:/g, '-') + '.xlsx';

        // Append to the DOM and trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up and remove the link
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.alertService.showAndCloseAlertAfterXSecond('Error downloading the file', 'red', 5000);
      }
    });
  }

  exportToPdf() {
    this.userService.exportToPdf().subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf;charset=utf-8' });
        
        // Create a link element
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'users_' + new Date().toISOString().split('.')[0].replace(/:/g, '-') + '.pdf';

        // Append to the DOM and trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up and remove the link
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.alertService.showAndCloseAlertAfterXSecond('Error downloading the file', 'red', 5000);
      }
    });
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length > 0) {
      this.pageSize = Number(target.value);
    } else {
      return;
    }
    this.getUsersByPage();
  }

  changeEnabledStatus(id: number, status: boolean) {
    this.userService.changeEnabledStatus(id, !status).subscribe({
      next: (res) => {
        if (res == null) {
          this.getUsersByPage();
          this.alertService.showAlert("The user ID " + id + " has been " + (status ? "disabled" : "enabled"), "green");
        } else {
          this.alertService.showAlert("An unexpected error occurred. Please try again later.", "red");
        }

        this.alertService.closeAlert(3000);
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  deleteUser(modalTemplate: TemplateRef<any>,  userID: number) {
    const title = "Confirm delete user has ID: " + userID;
    this.modalService
      .open(modalTemplate, { title: title })
      .subscribe((res) => {
        if (res == "yes") {
          this.userService.deleteUser(userID).subscribe({
            next: (res) => {
              if (res == null) {
                this.getUsersByPage();
                this.alertService.showAlert("The user ID " + userID + " has been deleted successfully.", "green");
              } else {
                this.alertService.showAlert("An unexpected error occurred. Please try again later.", "red");
              }

              this.alertService.closeAlert(3000);
            },
            error: (err) => {
              this.utilsService.handleError(err);
            }
          })
        }
      });
  }

  getUsersByPage() {
    let keyword = this.keyword.value ? this.keyword.value : '';
    this.userService.getUsersByPage(this.pageNum, this.pageSize, keyword, this.sortField, this.sortDir).subscribe({
      next: (res) => {
        this.listUsers = res.content;
        this.totalPages = res.totalPages;
        if (res.totalPages < this.pageNum) {
          this.goToPage(res.totalPages);
        }
        this.totalItems = res.totalItems;
      },
      error: (err) => {
        this.utilsService.handleError(err);
      }
    })
  }

  goToPage(pageNumber: number) {
    if (Number.isNaN(pageNumber)) {
      return
    } else if (pageNumber > this.totalPages || pageNumber < 1) {
      return;
    }
    this.pageNum = pageNumber;
    this.getUsersByPage();
  }

  get startCount(): number {
    if (this.totalItems == 0) return 0;
    return (this.pageNum - 1) * this.pageSize + 1;
  }

  get endCount(): number {
    if (this.pageSize < 1) {
      return this.totalItems;
    }
    return (this.pageNum * this.pageSize > this.totalItems) ? this.totalItems : this.pageNum * this.pageSize;
  }
}
