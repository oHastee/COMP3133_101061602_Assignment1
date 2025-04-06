// src/app/employee/employee-edit/employee-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-employee-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    AlertComponent,
    PageHeaderComponent
  ],
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class EmployeeEditComponent implements OnInit {
  employeeForm: FormGroup;
  employeeId: string | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  isFormLoading: boolean = true;
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  originalDateOfJoining: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
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
      date_of_joining: [''],
      email: ['', [Validators.email]],
      gender: [''],
      employee_photo: ['']
    });
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.loadEmployeeData(this.employeeId);
    } else {
      this.errorMessage = 'Employee ID is missing. Unable to load employee data.';
      this.isFormLoading = false;
    }
  }

  loadEmployeeData(id: string): void {
    this.isFormLoading = true;
    this.employeeService.searchEmployeeById(id).subscribe({
      next: (res: any) => {
        const emp = res.data.searchEmployeeById;
        if (emp) {
          // Store original date for reference
          this.originalDateOfJoining = emp.date_of_joining;

          // Convert ISO date string to YYYY-MM-DD for the date input
          const formattedDate = this.formatDateForInput(emp.date_of_joining);

          // Set image preview if available
          if (emp.employee_photo) {
            this.imagePreviewUrl = emp.employee_photo;
          }

          // Patch form values
          this.employeeForm.patchValue({
            first_name: emp.first_name,
            last_name: emp.last_name,
            designation: emp.designation,
            department: emp.department,
            salary: emp.salary,
            date_of_joining: formattedDate,
            email: emp.email || '',
            gender: emp.gender || '',
            employee_photo: emp.employee_photo || ''
          });

          this.isFormLoading = false;
        } else {
          this.errorMessage = 'Employee not found.';
          this.isFormLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Error loading employee:', err);
        this.errorMessage = 'An error occurred while loading employee data.';
        this.isFormLoading = false;
      }
    });
  }

  async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 300x300)
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > 300) {
              height *= 300 / width;
              width = 300;
            }
          } else {
            if (height > 300) {
              width *= 300 / height;
              height = 300;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx!.drawImage(img, 0, 0, width, height);

          // Convert to file with reduced quality
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/jpeg', 0.7); // 70% quality
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async onFileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    if (file) {
      try {
        console.log(`Original file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

        // File size check (temporary solution until backend is fixed)
        if (file.size > 300 * 1024) { // 300KB limit
          this.errorMessage = 'File size is too large. Please choose a file smaller than 300KB or it will be compressed.';
        }

        // Compress the image
        const compressedFile = await this.compressImage(file);
        console.log(`Compressed file size: ${compressedFile.size} bytes`);

        this.selectedFile = compressedFile;

        // Create image preview
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl = reader.result;
          console.log('Image preview created successfully');
        };
        reader.onerror = (error) => {
          console.error('Error creating image preview:', error);
        };
        reader.readAsDataURL(compressedFile);

        // Upload the compressed file
        this.apollo.mutate({
          mutation: UPLOAD_PROFILE_PICTURE,
          variables: { file: compressedFile },
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
            if (err.networkError && err.networkError.statusCode === 413) {
              this.errorMessage = 'The image is too large. Please choose a smaller image or compress it further.';
            } else {
              this.errorMessage = 'Failed to upload profile picture. Please try again.';
            }
          }
        });
      } catch (error) {
        console.error('Error processing image:', error);
        this.errorMessage = 'Failed to process image. Please try a different file.';
      }
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

    // Create a copy of form values
    const formValue = { ...this.employeeForm.value };

    // Remove empty values
    if (formValue.email === '') delete formValue.email;
    if (formValue.gender === '') delete formValue.gender;
    if (formValue.employee_photo === '') delete formValue.employee_photo;

    // Only update date_of_joining if it has changed
    if (formValue.date_of_joining) {
      formValue.date_of_joining = this.fromYYYYMMDDtoUTC(formValue.date_of_joining);
    } else {
      // Use the original date if not changed or keep it as-is
      delete formValue.date_of_joining;
    }

    if (this.employeeId) {
      // Add ID to the update object
      const updateData = { id: this.employeeId, ...formValue };

      this.employeeService.updateEmployee(updateData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.successMessage = 'Employee updated successfully!';
          console.log('Employee updated successfully:', res);

          // Navigate immediately to employees page for smoother transition
          this.router.navigate(['/employees']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error updating employee:', err);

          // Detailed error logging
          if (err.networkError) {
            console.error('Network error details:', err.networkError);
          }

          if (err.graphQLErrors && err.graphQLErrors.length > 0) {
            console.error('GraphQL errors:', err.graphQLErrors);
            this.errorMessage = err.graphQLErrors[0].message || 'An error occurred while updating the employee.';
          } else {
            this.errorMessage = 'An error occurred while updating the employee. Please try again.';
          }
        }
      });
    }
  }

  // Format date from ISO to YYYY-MM-DD for input
  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
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
