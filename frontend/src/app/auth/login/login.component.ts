// frontend/src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Username or Email</label>
          <input type="text" formControlName="usernameOrEmail" class="form-control" />
          <div *ngIf="loginForm.get('usernameOrEmail')?.invalid && loginForm.get('usernameOrEmail')?.touched" class="text-danger">
            Please enter your username or email.
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" formControlName="password" class="form-control" />
          <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-danger">
            Password is required.
          </div>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid">Login</button>
      </form>
      <div *ngIf="errorMessage" class="alert alert-danger mt-2">
        {{ errorMessage }}
      </div>
      <p>Don't have an account? <a routerLink="/signup">Sign up here</a></p>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .form-group { margin-bottom: 1rem; }
    .alert { margin-top: 1rem; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = ''; // Reset any previous error
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.data.login.token);
          this.router.navigate(['/employees']);
        },
        error: (err: any) => {
          // Retrieve error message from graphQLErrors if available; otherwise use err.message
          const errorMsg =
            err.graphQLErrors && err.graphQLErrors.length
              ? err.graphQLErrors[0].message
              : err.message;

          if (errorMsg.includes('No account found')) {
            this.errorMessage = 'No account found with that username or email.';
          } else if (errorMsg.includes('Incorrect password')) {
            this.errorMessage = 'Incorrect password. Please try again.';
          } else {
            this.errorMessage = 'An error occurred during login. Please try again later.';
          }
          console.error('Login error:', err);
        }
      });
    }
  }
}
