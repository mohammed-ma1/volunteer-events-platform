import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="flex min-h-dvh flex-col items-center justify-center bg-ink-100 px-4 py-12"
      [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
    >
      <div class="mx-auto flex w-full max-w-[420px] flex-col items-center">
        <div class="mb-8 flex w-full flex-col items-center text-center">
          <a
            routerLink="/"
            class="mx-auto flex w-max max-w-full shrink-0 justify-center outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-brand-900/25 focus-visible:ring-offset-2"
          >
            <img
              src="/images/branding/next-levels-logo.png"
              alt=""
              class="block h-14 w-auto max-w-full object-contain object-center sm:h-16"
              width="126"
              height="44"
            />
          </a>
          <h1 class="mt-6 w-full text-2xl font-bold text-brand-900">{{ i18n.t('forgotPassword.title') }}</h1>
          <p class="mt-1.5 w-full max-w-sm text-sm text-ink-600">{{ i18n.t('forgotPassword.subtitle') }}</p>
        </div>

        <div class="w-full rounded-2xl border border-ink-200/80 bg-white p-7 shadow-sm">
          @if (errorMessage()) {
            <div
              class="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-600"
            >
              <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ errorMessage() }}
            </div>
          }

          @if (infoMessage()) {
            <div class="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm text-emerald-800">
              {{ infoMessage() }}
            </div>
          }

          @if (!emailSent()) {
            <form [formGroup]="emailForm" (ngSubmit)="onSendCode()" class="space-y-4">
              <div>
                <label for="fp-email" class="mb-1.5 block text-sm font-medium text-brand-900">{{
                  i18n.t('forgotPassword.emailLabel')
                }}</label>
                <input
                  id="fp-email"
                  type="email"
                  formControlName="email"
                  placeholder="you@example.com"
                  class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-brand-900 outline-none transition-all placeholder:text-ink-400 focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
                  [class.border-red-300]="emailForm.controls.email.touched && emailForm.controls.email.invalid"
                />
              </div>
              <button type="submit" [disabled]="loading()" class="ve-btn-primary ve-btn-primary--block">
                @if (loading()) {
                  <span class="inline-flex items-center justify-center gap-2">
                    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {{ i18n.t('forgotPassword.sending') }}
                  </span>
                } @else {
                  {{ i18n.t('forgotPassword.sendCode') }}
                }
              </button>
            </form>
          } @else {
            <p class="mb-4 text-sm leading-relaxed text-ink-600">{{ i18n.t('forgotPassword.step2Hint') }}</p>
            <p class="mb-4 text-xs font-medium text-ink-500">
              {{ i18n.t('forgotPassword.emailLabel') }}:
              <span class="text-brand-900" dir="ltr">{{ savedEmail() }}</span>
            </p>
            <form [formGroup]="resetForm" (ngSubmit)="onReset()" class="space-y-4">
              <div>
                <label for="fp-otp" class="mb-1.5 block text-sm font-medium text-brand-900">{{
                  i18n.t('forgotPassword.otpLabel')
                }}</label>
                <input
                  id="fp-otp"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  autocomplete="one-time-code"
                  formControlName="otp"
                  class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-brand-900 outline-none transition-all focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
                  dir="ltr"
                />
              </div>
              <div>
                <label for="fp-pw" class="mb-1.5 block text-sm font-medium text-brand-900">{{
                  i18n.t('forgotPassword.newPassword')
                }}</label>
                <input
                  id="fp-pw"
                  type="password"
                  formControlName="password"
                  class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-brand-900 outline-none transition-all focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
                />
              </div>
              <div>
                <label for="fp-pw2" class="mb-1.5 block text-sm font-medium text-brand-900">{{
                  i18n.t('forgotPassword.confirmPassword')
                }}</label>
                <input
                  id="fp-pw2"
                  type="password"
                  formControlName="password_confirmation"
                  class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-brand-900 outline-none transition-all focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
                />
              </div>
              <button type="submit" [disabled]="loadingReset()" class="ve-btn-primary ve-btn-primary--block">
                @if (loadingReset()) {
                  <span class="inline-flex items-center justify-center gap-2">
                    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {{ i18n.t('forgotPassword.resetting') }}
                  </span>
                } @else {
                  {{ i18n.t('forgotPassword.resetSubmit') }}
                }
              </button>
            </form>
          }

          <p class="mt-6 text-center">
            <a routerLink="/login" class="text-sm font-semibold text-brand-900 underline-offset-2 hover:underline">{{
              i18n.t('forgotPassword.backLogin')
            }}</a>
          </p>
        </div>

        <p class="mt-6 text-center text-xs text-ink-500">&copy; {{ currentYear }} {{ i18n.t('footer.copyrightNextLevel') }}</p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);

  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  });

  loading = signal(false);
  loadingReset = signal(false);
  emailSent = signal(false);
  savedEmail = signal('');
  errorMessage = signal('');
  infoMessage = signal('');
  currentYear = new Date().getFullYear();

  onSendCode(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.infoMessage.set('');

    const email = this.emailForm.getRawValue().email.trim();
    this.auth.requestPasswordResetOtp(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.savedEmail.set(email);
        this.emailSent.set(true);
        this.infoMessage.set(this.i18n.t('forgotPassword.requestSent'));
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? this.i18n.t('forgotPassword.errGeneric'));
      },
    });
  }

  onReset(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    const { otp, password, password_confirmation } = this.resetForm.getRawValue();
    if (password !== password_confirmation) {
      this.errorMessage.set(
        this.i18n.locale() === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',
      );
      return;
    }

    this.loadingReset.set(true);
    this.errorMessage.set('');

    this.auth
      .resetPasswordWithOtp({
        email: this.savedEmail(),
        otp,
        password,
        password_confirmation,
      })
      .subscribe({
        next: () => {
          this.loadingReset.set(false);
          void this.router.navigate(['/login'], { queryParams: { pwdReset: 'ok' } });
        },
        error: (err: HttpErrorResponse) => {
          this.loadingReset.set(false);
          const msg = err.error?.message ?? '';
          if (err.status === 422) {
            this.errorMessage.set(msg || this.i18n.t('forgotPassword.errOtp'));
          } else {
            this.errorMessage.set(msg || this.i18n.t('forgotPassword.errGeneric'));
          }
        },
      });
  }
}
