import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Backdrop -->
    <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog" role="document">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Employee Details</h5>
            <button type="button" class="close" aria-label="Close" (click)="onClose()">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <p><strong>First Name:</strong> {{ employee?.first_name || 'Did not provide' }}</p>
            <p><strong>Last Name:</strong> {{ employee?.last_name || 'Did not provide' }}</p>
            <p><strong>Designation:</strong> {{ employee?.designation || 'Did not provide' }}</p>
            <p><strong>Department:</strong> {{ employee?.department || 'Did not provide' }}</p>
            <p>
              <strong>Salary:</strong>
              {{ employee?.salary != null ? employee.salary : 'Did not provide' }}
            </p>
            <p>
              <strong>Date of Joining:</strong>
              {{ getDateOfJoining(employee?.date_of_joining) }}
            </p>
            <p><strong>Email:</strong> {{ employee?.email || 'Did not provide' }}</p>
            <p><strong>Gender:</strong> {{ employee?.gender || 'Did not provide' }}</p>
            <p>
              <strong>Profile Picture:</strong>
              <ng-container *ngIf="employee?.employee_photo; else noPhoto">
                <img
                  [src]="employee.employee_photo"
                  alt="Profile"
                  style="max-width: 120px; display: block; margin-top: 8px;"
                />
              </ng-container>
              <ng-template #noPhoto>Did not provide</ng-template>
            </p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onClose()">Close</button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Ensure modal scroll if content overflows */
    .modal.fade.show.d-block {
      overflow-y: auto;
    }
  `]
})
export class EmployeeDetailsComponent {
  @Input() employee: any;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
  getDateOfJoining(value: any): string {
    // If there's no date value, show fallback
    if (!value) {
      return 'Did not provide';
    }

    let dateObj: Date;

    // If it's a number (timestamp), convert from milliseconds
    if (typeof value === 'number') {
      dateObj = new Date(value);
    } else {
      // Otherwise, assume it's a string like "2025-03-31T00:00:00.000Z"
      // or "2025-03-31"
      dateObj = new Date(value);
    }

    // If invalid, just show the raw value or fallback
    if (isNaN(dateObj.getTime())) {
      return 'Did not provide';
    }

    // Extract the date in UTC so there's no shift
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
