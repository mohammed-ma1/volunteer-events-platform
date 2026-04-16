import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="-mx-4 -mt-2 mb-8 rounded-2xl bg-ink-50 px-4 py-8 sm:mx-0 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
    <div class="mx-auto w-full max-w-md pb-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-brand-900">{{ i18n.t('changePassword.title') }}</h1>
        <p class="mt-1 text-sm text-ink-600">{{ i18n.t('changePassword.subtitle') }}</p>
      </div>

      <div class="rounded-2xl border border-ink-200/90 bg-white p-6 shadow-sm">
        @if (successMessage()) {
          <div class="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm text-emerald-800">
            {{ successMessage() }}
          </div>
        }
        @if (errorMessage()) {
          <div class="mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-600">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="current_password" class="mb-1.5 block text-sm font-medium text-brand-900">{{
              i18n.t('changePassword.labelCurrent')
            }}</label>
            <input
              id="current_password"
              type="password"
              formControlName="current_password"
              autocomplete="current-password"
              class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-brand-900 outline-none transition-all focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
              [class.border-red-300]="form.controls.current_password.touched && form.controls.current_password.invalid"
            />
            @if (form.controls.current_password.touched && form.controls.current_password.hasError('required')) {
              <p class="mt-1 text-xs text-red-500">{{ i18n.t('changePassword.errCurrentRequired') }}</p>
            }
          </div>

          <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-brand-900">{{
              i18n.t('changePassword.labelNew')
            }}</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-brand-900 outline-none transition-all focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
              [class.border-red-300]="form.controls.password.touched && form.controls.password.invalid"
            />
            @if (form.controls.password.touched && form.controls.password.hasError('required')) {
              <p class="mt-1 text-xs text-red-500">{{ i18n.t('changePassword.errNewRequired') }}</p>
            }
            @if (form.controls.password.touched && form.controls.password.hasError('minlength')) {
              <p class="mt-1 text-xs text-red-500">{{ i18n.t('changePassword.errMinLength') }}</p>
            }
          </div>

          <div>
            <label for="password_confirmation" class="mb-1.5 block text-sm font-medium text-brand-900">{{
              i18n.t('changePassword.labelConfirm')
            }}</label>
            <input
              id="password_confirmation"
              type="password"
              formControlName="password_confirmation"
              autocomplete="new-password"
              class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-brand-900 outline-none transition-all focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
              [class.border-red-300]="form.controls.password_confirmation.touched && form.hasError('passwordMismatch')"
            />
            @if (form.controls.password_confirmation.touched && form.hasError('passwordMismatch')) {
              <p class="mt-1 text-xs text-red-500">{{ i18n.t('changePassword.errMismatch') }}</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="ve-btn-primary ve-btn-primary--block"
          >
            @if (loading()) {
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {{ i18n.t('changePassword.submitting') }}
            } @else {
              {{ i18n.t('changePassword.submit') }}
            }
          </button>
        </form>

        <p class="mt-5 border-t border-ink-100 pt-5 text-center text-sm text-ink-600">
          <a routerLink="/dashboard" class="font-semibold text-brand-900 underline-offset-2 hover:underline">{{
            i18n.t('changePassword.backDashboard')
          }}</a>
        </p>
      </div>
    </div>
    </div>
  `,
})
export class ChangePasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);

  readonly form = this.fb.nonNullable.group(
    {
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: [ChangePasswordComponent.passwordMatchValidator] },
  );

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  private static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pw = control.get('password')?.value;
    const confirm = control.get('password_confirmation')?.value;
    return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.auth.changePassword(this.form.getRawValue()).subscribe({
      next: res => {
        this.loading.set(false);
        this.successMessage.set(res.message);
        this.form.reset();
        setTimeout(() => this.router.navigate(['/dashboard']), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message ?? this.i18n.t('changePassword.errGeneric');
        const errors = err.error?.errors;
        if (errors) {
          const first = Object.values(errors).flat()[0];
          this.errorMessage.set(typeof first === 'string' ? first : msg);
        } else {
          this.errorMessage.set(msg);
        }
      },
    });
  }
}
