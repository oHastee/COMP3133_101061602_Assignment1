import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pages: number[] = [];
  totalPages: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePages();
  }

  calculatePages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    // Ensure currentPage is within valid range
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.pageChange.emit(this.currentPage);
    }

    this.generatePagesArray();
  }

  generatePagesArray(): void {
    this.pages = [];

    if (this.totalPages <= 7) {
      // If total pages are 7 or less, show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i);
      }
    } else {
      // If more than 7 pages, use ellipsis
      if (this.currentPage <= 3) {
        // If current page is among first 3 pages
        this.pages = [1, 2, 3, 4, 5, -1, this.totalPages];
      } else if (this.currentPage >= this.totalPages - 2) {
        // If current page is among last 3 pages
        this.pages = [1, -1, this.totalPages - 4, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages];
      } else {
        // If current page is somewhere in the middle
        this.pages = [1, -1, this.currentPage - 1, this.currentPage, this.currentPage + 1, -1, this.totalPages];
      }
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }

  changePageSize(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const size = parseInt(selectElement.value, 10);
    if (size !== this.itemsPerPage) {
      this.pageSizeChange.emit(size);
    }
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
