import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuideCategory } from '../../../Models/GuideDTO/Guide';
import { GuideService } from '../../../Services/guide.service';

@Component({
  selector: 'app-guide-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './guide-form.component.html',
  styleUrl: './guide-form.component.css',
})
export class GuideFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private guideService = inject(GuideService);
  private destroyRef = inject(DestroyRef);

  readonly levels = ['Beginner', 'Intermediate', 'Advanced'];

  guideId: string | null = null;
  categories: GuideCategory[] = [];
  existingCoverUrl: string | null = null;
  existingVideoUrl: string | null = null;
  coverFile: File | null = null;
  coverPreview: string | null = null;
  loading = false;
  saving = false;
  showPreview = false;
  error = '';

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    summary: ['', [Validators.maxLength(500)]],
    contentHtml: ['', [Validators.required]],
    level: [''],
    expansion: [''],
    categoryId: [''],
    slug: [''],
    isPublished: [false],
    videoUrl: [''],
    videoCaption: [''],
    removeCover: [false],
    removeVideo: [false],
  });

  get isEdit(): boolean {
    return this.guideId !== null;
  }

  ngOnInit(): void {
    this.guideId = this.route.snapshot.paramMap.get('id');
    this.loadCategories();

    if (this.guideId) {
      this.loadGuide(this.guideId);
    }
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

  loadGuide(id: string): void {
    this.loading = true;

    this.guideService
      .getManagedById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (guide) => {
          const video = guide.media.find((media) => media.mediaType === 'Video');

          this.existingCoverUrl = guide.coverUrl;
          this.existingVideoUrl = video?.url ?? null;

          this.form.patchValue({
            title: guide.title,
            summary: guide.summary ?? '',
            contentHtml: guide.contentHtml,
            level: guide.level ?? '',
            expansion: guide.expansion ?? '',
            categoryId: guide.categoryId ?? '',
            slug: guide.slug,
            isPublished: guide.isPublished,
            videoUrl: video?.url ?? '',
            videoCaption: video?.caption ?? '',
          });

          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar la guía.';
          this.loading = false;
        },
      });
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.coverFile = file;

    if (this.coverPreview) {
      URL.revokeObjectURL(this.coverPreview);
    }

    this.coverPreview = file ? URL.createObjectURL(file) : null;

    if (file) {
      this.form.controls.removeCover.setValue(false);
    }
  }

  clearCover(): void {
    this.coverFile = null;

    if (this.coverPreview) {
      URL.revokeObjectURL(this.coverPreview);
      this.coverPreview = null;
    }

    this.form.controls.removeCover.setValue(true);
  }

  toggleRemoveVideo(): void {
    if (this.form.controls.removeVideo.value) {
      this.form.controls.videoUrl.setValue('');
      this.form.controls.videoCaption.setValue('');
    }
  }

  submit(): void {
    if (this.saving) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const value = this.form.getRawValue();
    const formData = new FormData();

    formData.append('title', value.title.trim());
    formData.append('summary', value.summary.trim());
    formData.append('contentHtml', value.contentHtml);
    formData.append('level', value.level);
    formData.append('expansion', value.expansion.trim());
    formData.append('categoryId', value.categoryId);
    formData.append('slug', value.slug.trim());
    formData.append('isPublished', String(value.isPublished));
    formData.append('removeCover', String(value.removeCover));
    formData.append('removeVideo', String(value.removeVideo));
    formData.append('videoUrl', value.videoUrl.trim());
    formData.append('videoCaption', value.videoCaption.trim());

    if (this.coverFile) {
      formData.append('cover', this.coverFile);
    }

    const request = this.guideId
      ? this.guideService.update(this.guideId, formData)
      : this.guideService.create(formData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.router.navigate(['/guides/manage']),
      error: (response) => {
        this.saving = false;
        this.error =
          response?.error?.detail ??
          response?.error?.title ??
          'No pudimos guardar la guía.';
      },
    });
  }
}
