// frontend/src/app/employee/employee-list/employee-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2>Employee List</h2>
      <!-- Add Employee Button -->
      <div class="mb-3">
        <button class="btn btn-primary" [routerLink]="['/employee/add']">
          + Add Employee
        </button>
      </div>

      <!-- Search Buttons -->
      <div class="btn-group mb-3">
        <button class="btn btn-secondary" (click)="onLoadAllEmployees()">Load All Employees</button>
        <button class="btn btn-secondary" (click)="onSearch('Engineer', '')">Search by Designation</button>
        <button class="btn btn-secondary" (click)="onSearch('', 'HR')">Search by Department</button>
      </div>

      <!-- Employees Table -->
      <table class="table table-bordered table-striped" *ngIf="employees.length">
        <thead class="thead-dark">
        <tr>
          <th>Id</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Designation</th>
          <th>Department</th>
          <th style="min-width: 240px;">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let emp of employees">
          <td>{{ emp.id }}</td>
          <td>{{ emp.first_name }}</td>
          <td>{{ emp.last_name }}</td>
          <td>{{ emp.designation }}</td>
          <td>{{ emp.department }}</td>
          <td>
            <!-- View Details -->
            <button class="btn btn-info btn-sm" (click)="viewDetails(emp)">
              View
            </button>
            <!-- Edit Employee -->
            <button class="btn btn-warning btn-sm" [routerLink]="['/employee/edit', emp.id]">
              Edit
            </button>
            <!-- Delete Employee -->
            <button class="btn btn-danger btn-sm" (click)="onDelete(emp.id)">
              Delete
            </button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Quick Detail Card -->
      <div class="card mt-4" *ngIf="selectedEmployee">
        <div class="card-header">
          <h5>Employee Details</h5>
        </div>
        <div class="card-body">
          <p><strong>First Name:</strong> {{ selectedEmployee.first_name || 'Did not provide' }}</p>
          <p><strong>Last Name:</strong> {{ selectedEmployee.last_name || 'Did not provide' }}</p>
          <p><strong>Email:</strong> {{ selectedEmployee.email || 'Did not provide' }}</p>
          <p><strong>Gender:</strong> {{ selectedEmployee.gender || 'Did not provide' }}</p>
          <p><strong>Designation:</strong> {{ selectedEmployee.designation || 'Did not provide' }}</p>
          <p><strong>Salary:</strong> {{ selectedEmployee.salary || 'Did not provide' }}</p>
          <p><strong>Date of Joining:</strong> {{ selectedEmployee.date_of_joining ? (selectedEmployee.date_of_joining | date:'longDate') : 'Did not provide' }}</p>
          <p><strong>Department:</strong> {{ selectedEmployee.department || 'Did not provide' }}</p>
          <div>
            <strong>Profile Picture:</strong>
            <div *ngIf="selectedEmployee.employee_photo; else noPhoto">
              <img [src]="selectedEmployee.employee_photo" alt="Employee Photo" class="img-thumbnail" style="max-width: 150px;" />
            </div>
            <ng-template #noPhoto>Did not provide</ng-template>
          </div>
          <button class="btn btn-secondary mt-3" (click)="closeDetails()">Close</button>
        </div>
      </div>
    </div>
  `,
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  selectedEmployee: any = null;

  constructor(private employeeService: EmployeeService, private router: Router) {
    // Subscribe to router events to refresh the employee list when navigating to /employees
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects === '/employees') {
          this.onLoadAllEmployees();
        }
      });
  }

  ngOnInit(): void {
    this.onLoadAllEmployees();
  }

  onLoadAllEmployees(): void {
    this.employeeService.getAllEmployees().subscribe((res: any) => {
      this.employees = res.data.getAllEmployees;
    });
  }

  onSearch(designation: string, department: string): void {
    this.employeeService.searchEmployeeByDesignationOrDepartment(designation, department).subscribe((res: any) => {
      this.employees = res.data.searchEmployeeByDesignationOrDepartment;
    });
  }

  viewDetails(emp: any): void {
    this.selectedEmployee = emp;
  }

  closeDetails(): void {
    this.selectedEmployee = null;
  }

  onDelete(id: string): void {
    this.employeeService.deleteEmployee(id).subscribe(() => {
      this.employees = this.employees.filter(emp => emp.id !== id);
      if (this.selectedEmployee && this.selectedEmployee.id === id) {
        this.closeDetails();
      }
    });
  }
}
