// frontend/src/app/auth/signup/signup.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="signup-container">
      <h2>Sign Up</h2>
      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Username</label>
          <input type="text" formControlName="username" class="form-control" />
          <div *ngIf="signupForm.get('username')?.invalid && signupForm.get('username')?.touched" class="text-danger">
            Username is required.
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" formControlName="email" class="form-control" />
          <div *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched" class="text-danger">
            Please enter a valid email address.
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" formControlName="password" class="form-control" />
          <div *ngIf="signupForm.get('password')?.invalid && signupForm.get('password')?.touched" class="text-danger">
            Password is required.
          </div>
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="signupForm.invalid">Sign Up</button>
      </form>
      <div *ngIf="errorMessage" class="alert alert-danger mt-2">
        {{ errorMessage }}
      </div>
      <p>Already have an account? <a routerLink="/login">Log in here</a></p>
    </div>
  `,
  styles: [`
    .signup-container {
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
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.errorMessage = ''; // Reset previous error
      this.authService.signup(this.signupForm.value).subscribe({
        next: (res: any) => {
          // On successful signup, navigate to login.
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          // Check backend error message for specific feedback:
          if (err.message && err.message.includes('Username already taken')) {
            this.errorMessage = 'Username already taken. Please choose a different username.';
          } else if (err.message && err.message.includes('Email already in use')) {
            this.errorMessage = 'Email already in use. Please choose a different email.';
          } else {
            this.errorMessage = 'An error occurred during signup. Please try again later.';
          }
          console.error('Signup error:', err);
        }
      });
    }
  }
}
