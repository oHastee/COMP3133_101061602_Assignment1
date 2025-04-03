// src/app/shared/components/confirmation-modal/confirmation-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export type ModalType = 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" @fadeIn (click)="onBackdropClick($event)">
      <div class="modal-container" @slideUp>
        <div class="modal-header">
          <div class="modal-icon" [ngClass]="'modal-icon-' + type">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="modalIcon"></svg>
          </div>
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" (click)="onCancel()" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-message">{{ message }}</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button type="button" [ngClass]="'btn ' + confirmButtonClass" (click)="onConfirm()" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner spinner-sm mr-2"></span>
            {{ isLoading ? 'Please wait...' : confirmText }}
          </button>
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
      max-width: 450px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-xl);
    }

    .modal-header {
      display: flex;
      align-items: center;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--border-color);
    }

    .modal-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: var(--space-4);
      flex-shrink: 0;
    }

    .modal-icon-danger {
      color: var(--danger-color);
      background-color: var(--danger-color-light);
    }

    .modal-icon-warning {
      color: var(--warning-color);
      background-color: var(--warning-color-light);
    }

    .modal-icon-info {
      color: var(--info-color);
      background-color: var(--info-color-light);
    }

    .modal-title {
      flex: 1;
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

    .modal-message {
      margin: 0;
      font-size: var(--font-size-base);
      color: var(--text-color);
      line-height: var(--line-height-relaxed);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--border-color);
      gap: var(--space-3);
    }

    @media (max-width: 480px) {
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
export class ConfirmationModalComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed with this action?';
  @Input() type: ModalType = 'danger';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() isLoading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Used to close when clicking the backdrop
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onCancel();
    }
  }

  // Get modal icon based on type
  get modalIcon(): string {
    switch (this.type) {
      case 'danger':
        return `
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        `;
      case 'warning':
        return `
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        `;
      case 'info':
      default:
        return `
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        `;
    }
  }

  // Get button class based on type
  get confirmButtonClass(): string {
    switch (this.type) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      case 'info':
      default:
        return 'btn-primary';
    }
  }
}
