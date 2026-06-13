import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert/alert.service';
import { ReviewService } from '../../services/review/review.service';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-reviews.component.html'
})
export class ProductReviewsComponent implements OnInit {
  productId = input.required<number>();

  private reviewService = inject(ReviewService);
  private destroyRef = inject(DestroyRef);
  public alertService = inject(AlertService);

  // Reviews State
  reviews = signal<any[]>([]);
  stats = signal<any>(null);
  currentPage = signal(0);
  totalPages = signal(0);
  hasReviewed = signal(false);
  isSubmitting = signal(false);
  newReview = { headline: '', comment: '', rating: 0 };

  // Success Modal State
  isSuccessModalOpen = signal(false);

  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.reviewService.getReviews(this.productId(), this.currentPage(), 5)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.reviews.set(res.data.content);
          this.totalPages.set(res.data.totalPages);
        },
        error: () => this.alertService.showAndCloseAlertAfterXSecond('Failed to load reviews.', 'red', 5000),
      });

    this.reviewService.getStatistics(this.productId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.stats.set(res.data),
        error: () => {},
      });
  }

  loadPage(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  submitReview() {
    if (!this.newReview.headline?.trim()) {
      this.alertService.showAndCloseAlertAfterXSecond('Headline is required and cannot be blank.', 'yellow', 5000);
      return;
    }
    if (!this.newReview.comment?.trim()) {
      this.alertService.showAndCloseAlertAfterXSecond('Comment is required and cannot be blank.', 'yellow', 5000);
      return;
    }
    if (!this.newReview.rating || this.newReview.rating < 1) {
      this.alertService.showAndCloseAlertAfterXSecond('Please select a valid rating (1-5 stars).', 'yellow', 5000);
      return;
    }

    this.isSubmitting.set(true);
    this.reviewService.createReview({ ...this.newReview, productId: this.productId() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.hasReviewed.set(true);
          this.isSubmitting.set(false);
          this.newReview = { headline: '', comment: '', rating: 0 };
          this.alertService.showAndCloseAlertAfterXSecond('Review submitted successfully! It will appear after admin approval.', 'green', 5000);
          this.loadData();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err?.error?.message || 'Failed to submit review. Please try again.';
          this.alertService.showAndCloseAlertAfterXSecond(msg, 'red', 5000);
        },
      });
  }

  closeSuccessModal() {
    this.isSuccessModalOpen.set(false);
  }
}