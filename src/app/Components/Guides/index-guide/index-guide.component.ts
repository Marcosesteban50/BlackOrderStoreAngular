import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GuideCategory, GuideSummary } from '../../../Models/GuideDTO/Guide';
import { GuideService } from '../../../Services/guide.service';

@Component({
  selector: 'app-index-guide',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './index-guide.component.html',
  styleUrl: './index-guide.component.css',
})
export class IndexGuideComponent implements OnInit {
  private guideService = inject(GuideService);
  private destroyRef = inject(DestroyRef);

  guides: GuideSummary[] = [];
  categories: GuideCategory[] = [];
  readonly levels = ['Beginner', 'Intermediate', 'Advanced'];

  loading = true;
  error = '';

  page = 1;
  readonly pageSize = 9;
  totalPages = 0;
  totalCount = 0;

  search = '';
  category = '';
  level = '';

  ngOnInit(): void {
    this.loadCategories();
    this.loadGuides();
  }

  loadGuides(): void {
    this.loading = true;
    this.error = '';

    this.guideService
      .getGuides({
        page: this.page,
        pageSize: this.pageSize,
        search: this.search.trim(),
        category: this.category,
        level: this.level,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.guides = result.items;
          this.totalPages = result.totalPages;
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar las guías. Intenta de nuevo.';
          this.loading = false;
        },
      });
  }

  loadCategories(): void {
    this.guideService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => (this.categories = categories),
        error: () => (this.categories = []),
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadGuides();
  }

  selectCategory(slug: string): void {
    this.category = this.category === slug ? '' : slug;
    this.applyFilters();
  }

  clearFilters(): void {
    this.search = '';
    this.category = '';
    this.level = '';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.page = page;
    this.loadGuides();
  }

  pages(): number[] {
    const total = this.totalPages;

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(this.page - 2, total - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
  }

  trackBySlug = (_: number, guide: GuideSummary): string => guide.slug;
}
