// src/app/employee/employee-list/employee-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmployeeDetailsComponent } from '../employee-details/employee-details.component';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { CustomDropdownComponent } from '../../shared/components/custom-dropdown/custom-dropdown.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NavbarComponent,
    AlertComponent,
    PageHeaderComponent,
    EmployeeDetailsComponent,
    ConfirmationModalComponent,
    PaginationComponent,
    CustomDropdownComponent
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger(60, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: any[] = [];
  filteredEmployees: any[] = [];
  paginatedEmployees: any[] = [];
  selectedEmployee: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  searchForm: FormGroup;
  formSubscription: Subscription | null = null;

  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;

  // Delete confirmation
  showDeleteConfirmation: boolean = false;
  employeeToDelete: any = null;
  isDeleting: boolean = false;

  // Dynamic options for dropdowns
  designationOptions: string[] = [];
  departmentOptions: string[] = [];
  designationOptionsFormatted: {value: string, label: string}[] = [];
  departmentOptionsFormatted: {value: string, label: string}[] = [];

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      designation: [''],
      department: [''],
    });
  }

  ngOnInit(): void {
    this.loadEmployees();

    // Set up form value changes listener with debounce and distinct check
    this.formSubscription = this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) =>
          JSON.stringify(a) === JSON.stringify(b)
        )
      )
      .subscribe(() => {
        this.currentPage = 1; // Reset to first page on filter change
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.employeeService.getAllEmployees().subscribe({
      next: (res: any) => {
        this.employees = res.data.getAllEmployees;
        this.filteredEmployees = [...this.employees];
        this.paginateEmployees();
        this.isLoading = false;

        // Extract unique designations and departments
        this.extractFilterOptions();
      },
      error: (err: any) => {
        console.error('Error loading employees:', err);
        this.errorMessage = 'Failed to load employees. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Extract unique values for filter dropdowns
  extractFilterOptions(): void {
    // Get unique designations
    const designations = new Set<string>();
    // Get unique departments
    const departments = new Set<string>();

    this.employees.forEach(emp => {
      if (emp.designation) designations.add(emp.designation);
      if (emp.department) departments.add(emp.department);
    });

    this.designationOptions = Array.from(designations).sort();
    this.departmentOptions = Array.from(departments).sort();

    // Format for the custom dropdown
    this.designationOptionsFormatted = [
      { value: '', label: 'All Designations' },
      ...this.designationOptions.map(d => ({ value: d, label: d }))
    ];

    this.departmentOptionsFormatted = [
      { value: '', label: 'All Departments' },
      ...this.departmentOptions.map(d => ({ value: d, label: d }))
    ];
  }

  // Handlers for dropdown changes
  onDesignationChange(value: string): void {
    this.searchForm.patchValue({ designation: value });
  }

  onDepartmentChange(value: string): void {
    this.searchForm.patchValue({ department: value });
  }

  applyFilters(): void {
    const { designation, department } = this.searchForm.value;

    if (!designation && !department) {
      // No filters applied
      this.filteredEmployees = [...this.employees];
      this.paginateEmployees();
      return;
    }

    // Apply filters on client side first (for better UX)
    this.filteredEmployees = this.employees.filter(emp => {
      const matchDesignation = !designation || emp.designation === designation;
      const matchDepartment = !department || emp.department === department;
      return matchDesignation && matchDepartment;
    });

    this.paginateEmployees();

    // Then fetch from server for accurate results
    this.fetchFilteredEmployees(designation, department);
  }

  fetchFilteredEmployees(designation: string, department: string): void {
    // Skip API call if both filters are empty
    if (!designation && !department) return;

    this.isLoading = true;

    this.employeeService.searchEmployeeByDesignationOrDepartment(designation, department).subscribe({
      next: (res: any) => {
        this.filteredEmployees = res.data.searchEmployeeByDesignationOrDepartment;
        this.paginateEmployees();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error searching employees:', err);
        this.errorMessage = 'Failed to search employees. Please try again.';
        this.isLoading = false;
      }
    });
  }

  paginateEmployees(): void {
    // Calculate total pages
    const totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize);

    // Ensure current page is valid
    if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredEmployees.length);
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.paginateEmployees();
  }

  onPageSizeChange(size: number): void {
    const currentFirstItem = (this.currentPage - 1) * this.pageSize + 1;
    this.pageSize = size;

    // Calculate which page would contain the first item from the previous page
    this.currentPage = Math.ceil(currentFirstItem / this.pageSize);

    // Ensure the current page is valid
    const maxPage = Math.ceil(this.filteredEmployees.length / this.pageSize);
    if (this.currentPage > maxPage) {
      this.currentPage = Math.max(1, maxPage);
    }

    this.paginateEmployees();
  }

  // Clear all filters
  clearFilters(): void {
    this.searchForm.patchValue({
      designation: '',
      department: ''
    }, { emitEvent: false });

    this.filteredEmployees = [...this.employees];
    this.paginateEmployees();
  }

  viewEmployee(employee: any): void {
    this.selectedEmployee = employee;
  }

  closeEmployeeDetails(): void {
    this.selectedEmployee = null;
  }

  // Delete employee operation with confirmation
  confirmDeleteEmployee(employee: any, event: Event): void {
    event.stopPropagation(); // Prevent row click
    this.employeeToDelete = employee;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.employeeToDelete = null;
    this.showDeleteConfirmation = false;
  }

  proceedWithDelete(): void {
    if (!this.employeeToDelete) return;

    this.isDeleting = true;
    const id = this.employeeToDelete.id;

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteConfirmation = false;
        this.successMessage = 'Employee deleted successfully';
        this.loadEmployees(); // Refresh the list

        // Close details if the deleted employee is being viewed
        if (this.selectedEmployee && this.selectedEmployee.id === id) {
          this.selectedEmployee = null;
        }

        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.isDeleting = false;
        this.showDeleteConfirmation = false;
        console.error('Error deleting employee:', err);
        this.errorMessage = 'Failed to delete employee. Please try again.';
      }
    });
  }

  // Format date to display in a readable format
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    try {
      // Extract date parts directly from ISO string to avoid timezone issues
      const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [_, year, month, day] = match;
        // Create date object with date parts (note: JavaScript months are 0-indexed)
        const date = new Date(Number(year), Number(month) - 1, Number(day));

        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      // Fallback to regular date parsing if pattern doesn't match
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  }
}
