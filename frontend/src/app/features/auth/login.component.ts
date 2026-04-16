import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-login',
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
              src="/images/branding/next-levels-logo.svg"
              alt=""
              class="block h-14 w-auto max-w-full object-contain object-center sm:h-16"
              width="126"
              height="44"
            />
          </a>
          <h1 class="mt-6 w-full text-2xl font-bold text-brand-900">{{ i18n.t('login.title') }}</h1>
          <p class="mt-1.5 w-full max-w-sm text-sm text-ink-600">{{ i18n.t('login.subtitle') }}</p>
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

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="mb-1.5 block text-sm font-medium text-brand-900">{{ i18n.t('login.email') }}</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="you@example.com"
                class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-brand-900 outline-none transition-all placeholder:text-ink-400 focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
                [class.border-red-300]="form.controls.email.touched && form.controls.email.invalid"
              />
              @if (form.controls.email.touched && form.controls.email.hasError('required')) {
                <p class="mt-1 text-xs text-red-500">Email is required</p>
              }
            </div>

            <div>
              <div class="mb-1.5 flex items-center justify-between gap-2">
                <label for="password" class="block text-sm font-medium text-brand-900">{{ i18n.t('login.password') }}</label>
                <a
                  routerLink="/login"
                  class="text-xs font-semibold text-brand-900 underline-offset-2 hover:underline"
                  (click)="$event.preventDefault()"
                  >{{ i18n.t('login.forgot') }}</a
                >
              </div>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 pe-10 text-sm text-brand-900 outline-none transition-all placeholder:text-ink-400 focus:border-brand-800 focus:bg-white focus:ring-2 focus:ring-brand-900/15"
                  [class.border-red-300]="form.controls.password.touched && form.controls.password.invalid"
                />
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute end-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-brand-900"
                >
                  <svg class="h-[1.125rem] w-[1.125rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (showPassword()) {
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    } @else {
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    }
                  </svg>
                </button>
              </div>
              @if (form.controls.password.touched && form.controls.password.hasError('required')) {
                <p class="mt-1 text-xs text-red-500">Password is required</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="ve-btn-primary ve-btn-primary--block"
            >
              @if (loading()) {
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {{ i18n.t('login.signingIn') }}
              } @else {
                {{ i18n.t('login.signIn') }}
              }
            </button>
          </form>
        </div>

        <p class="mt-6 text-center text-xs text-ink-500">&copy; {{ currentYear }} {{ i18n.t('footer.copyrightNextLevel') }}</p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  currentYear = new Date().getFullYear();

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }
}
