// src/app/auth/signup/signup.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
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
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;
  year = new Date().getFullYear();
  formSubmitted = false;

  // Password validation
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(this.passwordPattern)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      agreeTerms: [false, [
        Validators.requiredTrue
      ]]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }

  ngOnInit(): void {
    // Check if we're already logged in
    if (this.authService.isLoggedIn()) {
      void this.router.navigate(['/employees']);
    }

    // Add form change listener to help with debugging
    this.signupForm.statusChanges.subscribe(status => {
      console.log('Form status:', status);

      // Debug validation issues if form is invalid
      if (status === 'INVALID') {
        Object.keys(this.signupForm.controls).forEach(key => {
          const control = this.signupForm.get(key);
          if (control?.errors) {
            console.log(`Control ${key} has errors:`, control.errors);
          }
        });

        if (this.signupForm.errors) {
          console.log('Form-level errors:', this.signupForm.errors);
        }
      }
    });
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    // If passwords match but there are other errors on confirmPassword,
    // we only want to clear the mismatch error
    const confirmControl = form.get('confirmPassword');
    if (confirmControl?.errors && 'mismatch' in confirmControl.errors) {
      if (Object.keys(confirmControl.errors).length === 1) {
        confirmControl.setErrors(null);
      } else {
        const { mismatch, ...otherErrors } = confirmControl.errors;
        confirmControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
    }

    return null;
  }

// Update this method in your SignupComponent class

  onSubmit(): void {
    // Mark the form as submitted to show all validation errors
    this.formSubmitted = true;

    // Mark all fields as touched to trigger validation displays
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });

    // Force re-evaluation of form validity
    this.signupForm.updateValueAndValidity();

    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = ''; // Reset previous error

      // Get the raw values from the form - DO NOT TRIM THE PASSWORD
      const rawUsername = this.signupForm.value.username?.trim();
      const rawEmail = this.signupForm.value.email?.trim();
      const rawPassword = this.signupForm.value.password; // Don't trim password!

      // Get only the needed fields for the API call
      const signupData = {
        username: rawUsername,
        email: rawEmail,
        password: rawPassword
      };

      console.log('Submitting signup data with password length:', signupData.password.length);

      this.authService.signup(signupData).subscribe({
        next: () => {
          this.successMessage = 'Account created successfully! Redirecting to login...';

          // Store the credentials temporarily to help with debugging
          console.log('Account created successfully with username:', rawUsername);

          // On successful signup, navigate to login after a short delay
          setTimeout(() => {
            void this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err: any) => {
          this.isLoading = false;

          // Check backend error message for specific feedback:
          let errorMsg = '';
          if (err.networkError) {
            errorMsg = 'Network error. Please check your connection.';
          } else if (err.graphQLErrors?.length > 0) {
            errorMsg = err.graphQLErrors[0].message;
          } else {
            errorMsg = err.message || 'An error occurred during signup.';
          }

          if (errorMsg.includes('Username already taken')) {
            this.errorMessage = 'Username already taken. Please choose a different username.';
          } else if (errorMsg.includes('Email already in use')) {
            this.errorMessage = 'Email already in use. Please choose a different email.';
          } else {
            this.errorMessage = 'An error occurred during signup. Please try again later.';
          }
          console.error('Signup error:', err);
        }
      });
    } else {
      // Show general error message
      this.errorMessage = 'Please fix the validation errors before submitting the form.';

      // Check if terms is the only invalid field
      const termsControl = this.signupForm.get('agreeTerms');
      if (!termsControl?.valid && this.areOtherFieldsValid()) {
        this.errorMessage = 'Please agree to the terms and conditions to create an account.';
      }
    }
  }

  // Helper method to check if all fields except terms are valid
  areOtherFieldsValid(): boolean {
    const controls = this.signupForm.controls;
    return (
      controls['username'].valid &&
      controls['email'].valid &&
      controls['password'].valid &&
      controls['confirmPassword'].valid
    );
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Helper method to check for specific form control errors
  hasError(controlName: string, errorName: string): boolean {
    const control = this.signupForm.get(controlName);
    return !!(control && (control.touched || this.formSubmitted) && control.hasError(errorName));
  }
}
