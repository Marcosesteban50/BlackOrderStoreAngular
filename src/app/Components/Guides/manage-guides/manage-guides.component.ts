import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GuideSummary } from '../../../Models/GuideDTO/Guide';
import { GuideService } from '../../../Services/guide.service';

@Component({
  selector: 'app-manage-guides',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './manage-guides.component.html',
  styleUrl: './manage-guides.component.css',
})
export class ManageGuidesComponent implements OnInit {
  private guideService = inject(GuideService);
  private destroyRef = inject(DestroyRef);

  guides: GuideSummary[] = [];
  loading = true;
  error = '';
  deletingId: string | null = null;

  page = 1;
  readonly pageSize = 10;
  totalPages = 0;
  totalCount = 0;
  search = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.guideService
      .getManaged({ page: this.page, pageSize: this.pageSize, search: this.search.trim() })
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

  applySearch(): void {
    this.page = 1;
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }

    this.page = page;
    this.load();
  }

  pages(): number[] {
    const total = this.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(this.page - 2, total - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
  }

  remove(guide: GuideSummary): void {
    if (!window.confirm(`¿Eliminar la guía "${guide.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.deletingId = guide.id;
    this.error = '';

    this.guideService
      .delete(guide.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingId = null;
          this.load();
        },
        error: () => {
          this.deletingId = null;
          this.error = 'No pudimos eliminar la guía.';
        },
      });
  }
}
