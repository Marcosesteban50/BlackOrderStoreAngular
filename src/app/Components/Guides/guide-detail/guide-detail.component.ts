import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Guide, GuideMedia } from '../../../Models/GuideDTO/Guide';
import { GuideService } from '../../../Services/guide.service';

@Component({
  selector: 'app-guide-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './guide-detail.component.html',
  styleUrl: './guide-detail.component.css',
})
export class GuideDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private guideService = inject(GuideService);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  guide: Guide | null = null;
  loading = true;
  error = '';
  notFound = false;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.guideService
      .getBySlug(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (guide) => {
          this.guide = guide;
          this.loading = false;
        },
        error: (response) => {
          this.loading = false;

          if (response?.status === 404) {
            this.notFound = true;
          } else {
            this.error = 'No pudimos cargar esta guía. Intenta de nuevo.';
          }
        },
      });
  }

  videos(): GuideMedia[] {
    return (this.guide?.media ?? []).filter((media) => media.mediaType === 'Video');
  }

  embedUrl(media: GuideMedia): SafeResourceUrl | null {
    if (!media.externalId) {
      return null;
    }

    const id = encodeURIComponent(media.externalId);

    if (media.provider === 'youtube') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${id}`,
      );
    }

    if (media.provider === 'vimeo') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://player.vimeo.com/video/${id}`,
      );
    }

    return null;
  }

  reload(): void {
    this.error = '';
    this.loading = true;
    this.ngOnInit();
  }
}
