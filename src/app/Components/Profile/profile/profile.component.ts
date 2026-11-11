import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileDTO } from '../../../Models/Security/profileDTO';
import { SecurityService } from '../../../Services/security.service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private securityService = inject(SecurityService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  loading = true;
  saving = false;
  error = '';
  email = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    nickName: ['', [Validators.maxLength(100)]],
    address: ['', [Validators.maxLength(200)]],
    phone: ['', [Validators.maxLength(20)]],
  });

  get initials(): string {
    const value = this.form.controls.name.value || this.email || 'B';
    return value.slice(0, 1).toUpperCase();
  }

  ngOnInit(): void {
    this.securityService
      .getMyProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.email = profile.email;
          this.form.patchValue({
            name: profile.name ?? '',
            nickName: profile.nickName ?? '',
            address: profile.address ?? '',
            phone: profile.phone ?? '',
          });
          this.loading = false;
        },
        error: () => {
          this.error = 'No pudimos cargar tu perfil.';
          this.loading = false;
        },
      });
  }

  save(): void {
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
    const profile: UserProfileDTO = {
      name: value.name.trim(),
      nickName: value.nickName.trim(),
      address: value.address.trim(),
      phone: value.phone.trim(),
      email: this.email,
    };

    this.securityService
      .updateProfile(profile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          this.toast.success('Perfil actualizado.');
        },
        error: () => {
          this.saving = false;
          this.error = 'No pudimos guardar tus cambios.';
        },
      });
  }
}
