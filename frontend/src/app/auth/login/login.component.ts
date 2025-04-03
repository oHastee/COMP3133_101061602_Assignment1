// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  year: number = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if we're already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/employees']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = ''; // Reset any previous error

      const credentials = {
        usernameOrEmail: this.loginForm.value.usernameOrEmail,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (res: any) => {
          const token = res.data.login.token;
          localStorage.setItem('token', token);

          // If "remember me" is checked, store the preference
          if (this.loginForm.value.rememberMe) {
            localStorage.setItem('remember_user', 'true');
          }

          this.router.navigate(['/employees']);
        },
        error: (err: any) => {
          this.isLoading = false;

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
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Helper method to check for specific form control errors
  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
}
