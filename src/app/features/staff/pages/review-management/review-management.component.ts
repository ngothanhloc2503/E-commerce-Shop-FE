import { Component, OnInit, inject, signal, DestroyRef, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review/review.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AlertService } from '../../../../core/services/alert/alert.service';

type ModalMode = 'approve' | 'reject' | 'respond' | null;

@Component({
  selector: 'app-admin-review-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './review-management.component.html'
})
export class ReviewManagementComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private destroyRef = inject(DestroyRef);
  public alertService = inject(AlertService);

  // ViewChild
  respondModal = viewChild(ModalComponent);

  // State
  reviews = signal<any[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  currentTab = signal<'all' | 'pending' | 'approved'>('pending');
  isLoading = signal(false);

  // Respond Modal State
  modalMode = signal<ModalMode>(null);
  selectedReview = signal<any>(null);
  responseText = '';
  isProcessing = signal(false);

  tabs = [
    { label: '⏳ Pending', value: 'pending' as const },
    { label: '✅ Approved', value: 'approved' as const },
    { label: '📋 All', value: 'all' as const },
  ];

  ngOnInit() {
    this.loadReviews(0);
  }

  changeTab(tab: 'all' | 'pending' | 'approved') {
    this.currentTab.set(tab);
    this.currentPage.set(0);
    this.loadReviews(0);
  }

  loadReviews(page: number) {
    this.isLoading.set(true);
    this.currentPage.set(page);

    const approved = this.currentTab() === 'all' ? null
                   : this.currentTab() === 'approved';

    this.reviewService.getAdminReviews(page, 20, approved)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.reviews.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.alertService.showAndCloseAlertAfterXSecond('Failed to load reviews. Please try again.', 'red', 5000);
        },
      });
  }

  // 👇 Open Modal Helpers
  openApprove(review: any) {
    this.selectedReview.set(review);
    this.modalMode.set('approve');
  }

  openReject(review: any) {
    this.selectedReview.set(review);
    this.modalMode.set('reject');
  }

  openRespond(review: any) {
    this.selectedReview.set(review);
    this.responseText = review.response || '';
    this.modalMode.set('respond');
  }

  closeModal() {
    this.modalMode.set(null);
    this.selectedReview.set(null);
    this.responseText = '';
    this.isProcessing.set(false);
  }

  onModalSubmit() {
    const mode = this.modalMode();
    const review = this.selectedReview();
    if (!mode || !review) return;

    this.isProcessing.set(true);

    let request$;
    let successMsg = '';

    switch (mode) {
      case 'approve':
        request$ = this.reviewService.approveReview(review.id);
        successMsg = 'Review approved successfully!';
        break;
      case 'reject':
        request$ = this.reviewService.rejectReview(review.id);
        successMsg = 'Review rejected and deleted.';
        break;
      case 'respond':
        if (!this.responseText.trim()) {
          this.isProcessing.set(false);
          return;
        }
        request$ = this.reviewService.respondToReview(review.id, this.responseText);
        successMsg = 'Response sent successfully!';
        break;
    }

    request$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.alertService.showAndCloseAlertAfterXSecond(successMsg, 'green', 5000);
        this.closeModal();
        this.loadReviews(this.currentPage());
      },
      error: () => {
        this.isProcessing.set(false);
        this.alertService.showAndCloseAlertAfterXSecond(`Failed to ${mode} review.`, 'red', 5000);
      },
    });
  }
}