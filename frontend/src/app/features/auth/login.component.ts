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
    <div class="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[#0b1221] via-[#0f1a30] to-[#0b1221] px-4 py-12">
      <div class="w-full max-w-[420px]">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 mb-4 shadow-lg shadow-indigo-500/20">
            <svg class="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Welcome back</h1>
          <p class="text-sm text-white/50 mt-1">Sign in to access your workshops</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl shadow-black/20 p-7">
          @if (errorMessage()) {
            <div class="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input id="email" type="email" formControlName="email" placeholder="you@example.com"
                     class="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                     [class.border-red-300]="form.controls.email.touched && form.controls.email.invalid">
              @if (form.controls.email.touched && form.controls.email.hasError('required')) {
                <p class="mt-1 text-xs text-red-500">Email is required</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div class="relative">
                <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Enter your password"
                       class="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all pr-10"
                       [class.border-red-300]="form.controls.password.touched && form.controls.password.invalid">
                <button type="button" (click)="togglePassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (showPassword()) {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    }
                  </svg>
                </button>
              </div>
              @if (form.controls.password.touched && form.controls.password.hasError('required')) {
                <p class="mt-1 text-xs text-red-500">Password is required</p>
              }
            </div>

            <button type="submit" [disabled]="loading()"
                    class="w-full py-2.5 px-4 bg-brand-900 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-brand-900/20">
              @if (loading()) {
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="mt-5 pt-5 border-t border-slate-100 text-center">
            <p class="text-sm text-slate-500">
              Don't have an account?
              <a routerLink="/register" class="font-semibold text-brand-700 hover:text-brand-900 transition-colors">Create one</a>
            </p>
          </div>
        </div>

        <p class="text-center text-white/30 text-xs mt-6">&copy; {{ currentYear }} Volunteer Events Platform</p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  currentYear = new Date().getFullYear();

  togglePassword(): void {
    this.showPassword.update(v => !v);
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
