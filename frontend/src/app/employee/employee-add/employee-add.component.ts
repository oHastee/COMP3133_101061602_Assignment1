import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2>Add Employee</h2>
      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
        <!-- First Name -->
        <div class="form-group">
          <label>First Name</label>
          <input type="text" formControlName="first_name" class="form-control" />
          <div *ngIf="employeeForm.get('first_name')?.invalid && employeeForm.get('first_name')?.touched" class="text-danger">
            First name is required.
          </div>
        </div>
        <!-- Last Name -->
        <div class="form-group">
          <label>Last Name</label>
          <input type="text" formControlName="last_name" class="form-control" />
          <div *ngIf="employeeForm.get('last_name')?.invalid && employeeForm.get('last_name')?.touched" class="text-danger">
            Last name is required.
          </div>
        </div>
        <!-- Designation -->
        <div class="form-group">
          <label>Designation</label>
          <input type="text" formControlName="designation" class="form-control" />
          <div *ngIf="employeeForm.get('designation')?.invalid && employeeForm.get('designation')?.touched" class="text-danger">
            Designation is required.
          </div>
        </div>
        <!-- Department -->
        <div class="form-group">
          <label>Department</label>
          <input type="text" formControlName="department" class="form-control" />
          <div *ngIf="employeeForm.get('department')?.invalid && employeeForm.get('department')?.touched" class="text-danger">
            Department is required.
          </div>
        </div>
        <!-- Salary -->
        <div class="form-group">
          <label>Salary</label>
          <input type="number" formControlName="salary" class="form-control" step="0.01" />
          <div *ngIf="employeeForm.get('salary')?.invalid && employeeForm.get('salary')?.touched" class="text-danger">
            Salary is required and must be at least 1000.
          </div>
        </div>
        <!-- Date of Joining -->
        <div class="form-group">
          <label>Date of Joining</label>
          <input type="date" formControlName="date_of_joining" class="form-control" />
          <div *ngIf="employeeForm.get('date_of_joining')?.invalid && employeeForm.get('date_of_joining')?.touched" class="text-danger">
            Date of joining is required.
          </div>
        </div>
        <!-- Email (optional) -->
        <div class="form-group">
          <label>Email (optional)</label>
          <input type="email" formControlName="email" class="form-control" />
        </div>
        <!-- Gender (optional) -->
        <div class="form-group">
          <label>Gender (optional)</label>
          <select formControlName="gender" class="form-control">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <!-- Profile Picture (optional) -->
        <div class="form-group">
          <label>Profile Picture (optional)</label>
          <input type="file" (change)="onFileSelected($event)" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary" [disabled]="employeeForm.invalid">
          Add Employee
        </button>
      </form>
      <div *ngIf="errorMessage" class="alert alert-danger mt-2">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 2rem auto; }
    .form-group { margin-bottom: 1rem; }
    .alert { margin-top: 1rem; }
    .form-control.ng-pristine { background-color: #e9ecef; }
    .form-control.ng-dirty { background-color: #ffffff; }
  `]
})
export class EmployeeAddComponent implements OnInit {
  employeeForm: FormGroup;
  errorMessage: string = '';
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private router: Router, private employeeService: EmployeeService) {
    this.employeeForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      salary: [null, [Validators.required, Validators.min(1000)]],
      date_of_joining: ['', Validators.required],
      email: [''],
      gender: [''],
      employee_photo: ['']
    });
  }

  ngOnInit(): void { }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.employeeForm.patchValue({ employee_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.errorMessage = 'Please fill out the required fields correctly.';
      return;
    }
    const formValue = { ...this.employeeForm.value };
    this.errorMessage = '';
    if (formValue.email === '') delete formValue.email;
    if (formValue.gender === '') delete formValue.gender;

    // Convert "YYYY-MM-DD" to a UTC ISO string at midnight.
    formValue.date_of_joining = this.fromYYYYMMDDtoUTC(formValue.date_of_joining);

    this.employeeService.addEmployee(formValue).subscribe({
      next: () => {
        console.log('Employee added successfully');
        this.router.navigate(['/employees']).then(() => window.location.reload());
      },
      error: (err: any) => {
        console.error('Error adding employee:', err);
        this.errorMessage = 'An error occurred while adding the employee. Please try again.';
      }
    });
  }

  private fromYYYYMMDDtoUTC(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
  }
}
