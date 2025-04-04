import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-dropdown-container" [class.open]="isOpen">
      <button
        class="custom-select"
        type="button"
        (click)="toggleDropdown()"
        [attr.aria-label]="'Filter by ' + label"
      >
        <span class="select-value">{{ selectedValue || placeholder }}</span>
        <span class="dropdown-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      <div class="dropdown-options" *ngIf="isOpen" @fadeInDown>
        <div
          class="dropdown-option"
          *ngFor="let option of options"
          [class.selected]="option === selectedValue"
          (click)="onSelect(option)"
        >
          {{ option }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-dropdown-container {
      position: relative;
      width: 100%;
      min-width: 180px;
    }

    .custom-select {
      appearance: none;
      width: 100%;
      padding: 12px 14px;
      background-color: white;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      outline: none;
      text-align: left;
    }

    .custom-select:hover {
      border-color: var(--primary-color-dark);
    }

    .custom-select:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .dropdown-arrow {
      margin-left: 8px;
      color: var(--text-color-light);
      transition: transform 0.2s ease;
      display: flex;
      align-items: center;
    }

    .custom-dropdown-container.open .dropdown-arrow {
      transform: rotate(180deg);
    }

    .dropdown-options {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      right: 0;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      max-height: 300px;
      overflow-y: auto;
      z-index: 10;
      border: 1px solid var(--border-color);
    }

    .dropdown-option {
      padding: 12px 14px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .dropdown-option:hover {
      background-color: var(--primary-color-50);
    }

    .dropdown-option.selected {
      background-color: var(--primary-color-100);
      color: var(--primary-color);
      font-weight: 500;
    }

    .select-value {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `],
  animations: [
    trigger('fadeInDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class CustomDropdownComponent {
  @Input() options: string[] = [];
  @Input() selectedValue: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() label: string = '';
  @Output() selectionChange = new EventEmitter<string>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onSelect(option: string) {
    this.selectedValue = option;
    this.selectionChange.emit(option);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
