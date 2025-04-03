// src/app/employee/employee-list/employee-list.component.ts
import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
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
    PageHeaderComponent
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
  @ViewChild('designationSelect', { static: false }) designationSelect?: ElementRef;
  @ViewChild('departmentSelect', { static: false }) departmentSelect?: ElementRef;

  employees: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  searchForm: FormGroup;
  formSubscription: Subscription | null = null;

  // Dynamic options for dropdowns
  designationOptions: string[] = [];
  departmentOptions: string[] = [];

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private fb: FormBuilder,
    private el: ElementRef
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
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const designationContainer = this.el.nativeElement.querySelector('.designation-dropdown-container');
    const departmentContainer = this.el.nativeElement.querySelector('.department-dropdown-container');

    // Close designation dropdown if clicked outside
    if (designationContainer && !designationContainer.contains(target)) {
      this.designationSelect?.nativeElement.blur();
    }

    // Close department dropdown if clicked outside
    if (departmentContainer && !departmentContainer.contains(target)) {
      this.departmentSelect?.nativeElement.blur();
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
  }

  applyFilters(): void {
    const { designation, department } = this.searchForm.value;

    if (!designation && !department) {
      // No filters applied
      this.filteredEmployees = [...this.employees];
      return;
    }

    // Apply filters on client side first (for better UX)
    this.filteredEmployees = this.employees.filter(emp => {
      const matchDesignation = !designation || emp.designation === designation;
      const matchDepartment = !department || emp.department === department;
      return matchDesignation && matchDepartment;
    });

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
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error searching employees:', err);
        this.errorMessage = 'Failed to search employees. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Clear all filters
  clearFilters(): void {
    this.searchForm.patchValue({
      designation: '',
      department: ''
    }, { emitEvent: false });

    this.filteredEmployees = [...this.employees];
  }

  viewEmployee(employee: any): void {
    this.selectedEmployee = employee;
  }

  closeEmployeeDetails(): void {
    this.selectedEmployee = null;
  }

  deleteEmployee(id: string, event: Event): void {
    event.stopPropagation(); // Prevent row click

    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
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
        console.error('Error deleting employee:', err);
        this.errorMessage = 'Failed to delete employee. Please try again.';
      }
    });
  }

  // Format date to display in a readable format
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
