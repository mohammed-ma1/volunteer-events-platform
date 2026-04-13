import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
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
          <h1 class="text-2xl font-bold text-white">Create your account</h1>
          <p class="text-sm text-white/50 mt-1">Join the learning platform</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl shadow-black/20 p-7">
          @if (errorMessage()) {
            <div class="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input id="name" type="text" formControlName="name" placeholder="Your full name"
                     class="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                     [class.border-red-300]="form.controls.name.touched && form.controls.name.invalid">
              @if (form.controls.name.touched && form.controls.name.hasError('required')) {
                <p class="mt-1 text-xs text-red-500">Name is required</p>
              }
            </div>

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
              <input id="password" type="password" formControlName="password" placeholder="At least 8 characters"
                     class="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                     [class.border-red-300]="form.controls.password.touched && form.controls.password.invalid">
              @if (form.controls.password.touched && form.controls.password.hasError('required')) {
                <p class="mt-1 text-xs text-red-500">Password is required</p>
              }
              @if (form.controls.password.touched && form.controls.password.hasError('minlength')) {
                <p class="mt-1 text-xs text-red-500">Password must be at least 8 characters</p>
              }
            </div>

            <div>
              <label for="confirm" class="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input id="confirm" type="password" formControlName="password_confirmation" placeholder="Confirm your password"
                     class="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                     [class.border-red-300]="form.controls.password_confirmation.touched && form.hasError('passwordMismatch')">
              @if (form.controls.password_confirmation.touched && form.hasError('passwordMismatch')) {
                <p class="mt-1 text-xs text-red-500">Passwords do not match</p>
              }
            </div>

            <button type="submit" [disabled]="loading()"
                    class="w-full py-2.5 px-4 bg-brand-900 hover:bg-brand-800 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-brand-900/20">
              @if (loading()) {
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Creating account...
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="mt-5 pt-5 border-t border-slate-100 text-center">
            <p class="text-sm text-slate-500">
              Already have an account?
              <a routerLink="/login" class="font-semibold text-brand-700 hover:text-brand-900 transition-colors">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: [this.passwordMatchValidator] });

  loading = signal(false);
  errorMessage = signal('');

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
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

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Registration failed.';
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
