// src/app/employee/employee-details/employee-details.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="modal-overlay" @fadeIn (click)="onClose()">
      <div class="modal-container" @slideUp (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Employee Details</h3>
          <button class="modal-close" (click)="onClose()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="employee-profile">
            <div class="profile-header">
              <div class="employee-avatar-large" *ngIf="employee?.employee_photo">
                <img [src]="employee?.employee_photo" alt="Profile Photo">
              </div>
              <div class="employee-avatar-large placeholder" *ngIf="!employee?.employee_photo">
                {{employee?.first_name?.charAt(0) || ''}}{{employee?.last_name?.charAt(0) || ''}}
              </div>
              <div class="employee-info">
                <h4>{{employee?.first_name || ''}} {{employee?.last_name || ''}}</h4>
                <p class="employee-title">{{employee?.designation || 'N/A'}}</p>
                <p class="employee-department">{{employee?.department || 'N/A'}}</p>
              </div>
            </div>

            <div class="profile-details">
              <div class="detail-row">
                <div class="detail-label">Email</div>
                <div class="detail-value">{{employee?.email || 'Not provided'}}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Gender</div>
                <div class="detail-value">{{employee?.gender || 'Not provided'}}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Salary</div>
                <div class="detail-value">\${{employee?.salary?.toLocaleString() || 'N/A'}}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Joining Date</div>
                <div class="detail-value">{{formatDate(employee?.date_of_joining)}}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="onClose()">
            Close
          </button>
          <a *ngIf="employee?.id" [routerLink]="['/employee/edit', employee.id]" class="btn btn-primary">
            Edit Employee
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-index-modal);
      padding: var(--space-4);
    }

    .modal-container {
      background-color: var(--surface-color);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-xl);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--border-color);
    }

    .modal-title {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
    }

    .modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background-color: transparent;
      cursor: pointer;
      color: var(--text-color-light);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .modal-close:hover {
      background-color: var(--gray-100);
      color: var(--text-color);
    }

    .modal-body {
      padding: var(--space-6);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--border-color);
    }

    /* Employee profile */
    .employee-profile {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .employee-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: var(--shadow-md);
    }

    .employee-avatar-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .employee-avatar-large.placeholder {
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-xl);
    }

    .employee-info h4 {
      margin: 0 0 var(--space-1);
      font-size: var(--font-size-xl);
      color: var(--text-color);
      font-weight: var(--font-weight-semibold);
    }

    .employee-title {
      margin: 0 0 var(--space-1);
      color: var(--primary-color);
      font-weight: var(--font-weight-medium);
    }

    .employee-department {
      margin: 0;
      color: var(--text-color-light);
    }

    .profile-details {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .detail-label {
      font-size: var(--font-size-sm);
      color: var(--text-color-light);
      font-weight: var(--font-weight-medium);
    }

    .detail-value {
      color: var(--text-color);
      font-weight: var(--font-weight-medium);
    }

    @media (max-width: 480px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }

      .profile-details {
        grid-template-columns: 1fr;
      }

      .modal-footer {
        flex-direction: column-reverse;
      }

      .modal-footer .btn {
        width: 100%;
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class EmployeeDetailsComponent {
  @Input() employee: any;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  formatDate(dateString: string | undefined): string {
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
          month: 'long',
          day: 'numeric'
        });
      }

      // Fallback to regular date parsing if pattern doesn't match
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  }
}
