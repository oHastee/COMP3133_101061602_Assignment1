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

      // Get raw values - don't modify the password at all
      const credentials = {
        usernameOrEmail: this.loginForm.value.usernameOrEmail?.trim() || '',
        password: this.loginForm.value.password || '' // Keep exactly as entered
      };

      console.log(`Login attempt for: ${credentials.usernameOrEmail}, password length: ${credentials.password.length}`);

      // Check if this is the last created user from signup
      const lastCreatedUser = sessionStorage.getItem('last_created_user');
      const lastCreatedPassword = sessionStorage.getItem('last_created_password');

      if (lastCreatedUser === credentials.usernameOrEmail) {
        console.log('This is the last created user. Stored password length:',
          lastCreatedPassword ? lastCreatedPassword.length : 'not found');

        if (lastCreatedPassword && lastCreatedPassword !== credentials.password) {
          console.log('WARNING: Password mismatch between stored and entered!');
          console.log(`Stored: length=${lastCreatedPassword.length}`);
          console.log(`Entered: length=${credentials.password.length}`);
        }
      }

      this.authService.login(credentials).subscribe({
        next: (res: any) => {
          const token = res.data.login.token;
          localStorage.setItem('token', token);

          // If "remember me" is checked, store the preference
          if (this.loginForm.value.rememberMe) {
            localStorage.setItem('remember_user', 'true');
          }

          // Clear temporary signup data if present
          sessionStorage.removeItem('last_created_user');
          sessionStorage.removeItem('last_created_password');

          this.router.navigate(['/employees']);
        },
        error: (err: any) => {
          this.isLoading = false;

          // Get detailed error info
          let errorMessage = '';

          if (err.graphQLErrors && err.graphQLErrors.length > 0) {
            errorMessage = err.graphQLErrors[0].message;
            console.error('GraphQL Error:', err.graphQLErrors[0]);
          } else if (err.networkError) {
            errorMessage = 'Network error. Please check your connection.';
            console.error('Network Error:', err.networkError);
          } else {
            errorMessage = err.message || 'An error occurred during login';
            console.error('Other Error:', err);
          }

          // Log detailed debugging info
          console.log('Login error details:', {
            username: credentials.usernameOrEmail,
            passwordLength: credentials.password.length,
            errorMessage
          });

          // Set user-friendly error messages
          if (errorMessage.includes('No account found')) {
            this.errorMessage = 'No account found with that username or email.';
          } else if (errorMessage.includes('Incorrect password')) {
            this.errorMessage = 'Incorrect password. Please try again.';
          } else {
            this.errorMessage = 'An error occurred during login. Please try again later.';
          }
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
