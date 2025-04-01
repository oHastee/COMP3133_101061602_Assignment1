import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EmployeeService } from '../../core/services/employee.service';
import { EmployeeDetailsComponent } from '../employee-details/employee-details.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, EmployeeDetailsComponent],
  template: `
    <div class="container">
      <div class="d-flex justify-content-between align-items-center my-3">
        <h2 class="mb-0">Employee List</h2>
        <!-- Logout Button -->
        <button class="btn btn-secondary" (click)="logout()">Logout</button>
      </div>

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

      <!-- Employee Details Modal -->
      <app-employee-details
        *ngIf="selectedEmployee"
        [employee]="selectedEmployee"
        (close)="closeDetails()"
      ></app-employee-details>
    </div>
  `,
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  selectedEmployee: any = null;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {
    // Refresh the employee list when navigating to /employees
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
    this.employeeService
      .searchEmployeeByDesignationOrDepartment(designation, department)
      .subscribe((res: any) => {
        this.employees = res.data.searchEmployeeByDesignationOrDepartment;
      });
  }

  viewDetails(emp: any): void {
    console.log('[DEBUG] Employee to view:', emp);
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
