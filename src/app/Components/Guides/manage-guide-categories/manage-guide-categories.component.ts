import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GuideCategory } from '../../../Models/GuideDTO/Guide';
import { GuideService } from '../../../Services/guide.service';

@Component({
  selector: 'app-manage-guide-categories',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './manage-guide-categories.component.html',
  styleUrl: './manage-guide-categories.component.css',
})
export class ManageGuideCategoriesComponent implements OnInit {
  private guideService = inject(GuideService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  categories: GuideCategory[] = [];
  editingId: string | null = null;
  loading = true;
  saving = false;
  error = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.maxLength(120)]],
    description: ['', [Validators.maxLength(500)]],
    sortOrder: [0],
  });

  get isEdit(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.guideService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar las categorías.';
          this.loading = false;
        },
      });
  }

  edit(category: GuideCategory): void {
    this.editingId = category.id;

    this.form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      sortOrder: category.sortOrder,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset({ name: '', slug: '', description: '', sortOrder: 0 });
    this.error = '';
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
    const model = {
      name: value.name.trim(),
      slug: value.slug.trim() || null,
      description: value.description.trim() || null,
      sortOrder: Number(value.sortOrder) || 0,
    };

    const request = this.editingId
      ? this.guideService.updateCategory(this.editingId, model)
      : this.guideService.createCategory(model);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving = false;
        this.cancelEdit();
        this.load();
      },
      error: (response) => {
        this.saving = false;
        this.error =
          response?.error?.detail ??
          response?.error?.title ??
          'No pudimos guardar la categoría.';
      },
    });
  }

  remove(category: GuideCategory): void {
    if (
      !window.confirm(
        `¿Eliminar la categoría "${category.name}"? Las guías asociadas quedarán sin categoría.`,
      )
    ) {
      return;
    }

    this.guideService
      .deleteCategory(category.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.editingId === category.id) {
            this.cancelEdit();
          }
          this.load();
        },
        error: () => {
          this.error = 'No pudimos eliminar la categoría.';
        },
      });
  }
}
