// src/app/employee/employee-add/employee-add.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

const UPLOAD_PROFILE_PICTURE = gql`
  mutation UploadProfilePicture($file: Upload!) {
    uploadProfilePicture(file: $file)
  }
`;

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    NavbarComponent,
    AlertComponent,
    PageHeaderComponent
  ],
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class EmployeeAddComponent implements OnInit {
  employeeForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeService: EmployeeService,
    private apollo: Apollo
  ) {
    this.employeeForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      designation: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      department: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      salary: [null, [Validators.required, Validators.min(1000), Validators.max(1000000)]],
      date_of_joining: ['', [Validators.required]],
      email: ['', [Validators.email]],
      gender: [''],
      employee_photo: ['']
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      console.log(`File selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      this.selectedFile = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
        console.log('Image preview created successfully');
      };
      reader.onerror = (error) => {
        console.error('Error creating image preview:', error);
      };
      reader.readAsDataURL(file);

      // Upload the file
      this.apollo.mutate({
        mutation: UPLOAD_PROFILE_PICTURE,
        variables: { file },
        context: {
          useMultipart: true
        }
      }).subscribe({
        next: (res: any) => {
          // Set the returned URL into the employee_photo field
          this.employeeForm.patchValue({ employee_photo: res.data.uploadProfilePicture });
          console.log('File uploaded successfully', res.data.uploadProfilePicture);
        },
        error: (err) => {
          console.error('File upload error:', err);

          // Detailed error logging
          if (err.networkError) {
            console.error('Network error details:', err.networkError);
            if (err.networkError.statusCode) {
              console.error('Status code:', err.networkError.statusCode);
            }
            if (err.networkError.error) {
              console.error('Network error body:', err.networkError.error);
            }
          }

          if (err.graphQLErrors && err.graphQLErrors.length > 0) {
            console.error('GraphQL errors:', err.graphQLErrors);
            err.graphQLErrors.forEach((graphQLError: any, index: number) => {
              console.error(`GraphQL error ${index + 1}:`, graphQLError.message);
              if (graphQLError.extensions) {
                console.error('Extensions:', graphQLError.extensions);
              }
            });
          }

          // Set user-friendly error message
          this.errorMessage = 'Failed to upload profile picture. Please try again.';
        }
      });
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.employeeForm.controls).forEach(key => {
        const control = this.employeeForm.get(key);
        control?.markAsTouched();
      });

      this.errorMessage = 'Please fill out all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = { ...this.employeeForm.value };

    // Remove empty values
    if (formValue.email === '') delete formValue.email;
    if (formValue.gender === '') delete formValue.gender;
    if (formValue.employee_photo === '') delete formValue.employee_photo;

    // Convert "YYYY-MM-DD" to a UTC ISO string at midnight
    formValue.date_of_joining = this.fromYYYYMMDDtoUTC(formValue.date_of_joining);

    console.log('Submitting employee data:', formValue);

    this.employeeService.addEmployee(formValue).subscribe({
      next: (res: any) => {
        console.log('Employee added successfully:', res);
        this.isLoading = false;
        this.successMessage = 'Employee added successfully!';

        // Navigate immediately to employees page without clearing the form
        // This provides a smoother transition
        this.router.navigate(['/employees']);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error adding employee:', err);

        // Detailed error logging
        if (err.networkError) {
          console.error('Network error details:', err.networkError);
        }

        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
          console.error('GraphQL errors:', err.graphQLErrors);
          this.errorMessage = err.graphQLErrors[0].message || 'An error occurred while adding the employee.';
        } else {
          this.errorMessage = 'An error occurred while adding the employee. Please try again.';
        }
      }
    });
  }

  // Format date to UTC but preserve the day
  private fromYYYYMMDDtoUTC(dateStr: string): string {
    if (!dateStr) return '';

    // Parse the date string to create a Date object in local timezone
    const [year, month, day] = dateStr.split('-').map(Number);

    // Create a date object, but preserve the day by using local timezone
    const date = new Date(year, month - 1, day);

    // Format to ISO string but ensure we maintain the day
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
  }

  // Helper method to check for specific form control errors
  hasError(controlName: string, errorName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // Helper method to get the error message
  getErrorMessage(controlName: string): string {
    const control = this.employeeForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
    }
    if (control.errors['min']) {
      return `Minimum value is ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `Maximum value is ${control.errors['max'].max}`;
    }
    if (control.errors['email']) return 'Please enter a valid email address';

    return 'Invalid value';
  }
}
