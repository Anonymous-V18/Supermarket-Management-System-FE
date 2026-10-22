// One page of a backend "search" endpoint; page numbers start at 0
export class PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;

  constructor(
    items: T[],
    page: number,
    size: number,
    totalItems: number,
    totalPages: number
  ) {
    this.items = items;
    this.page = page;
    this.size = size;
    this.totalItems = totalItems;
    this.totalPages = totalPages;
  }
}
