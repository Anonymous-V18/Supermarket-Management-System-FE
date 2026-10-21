import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  // Mobile (< 768px): sidebar is an off-canvas drawer.
  readonly sidebarOpen = signal(false);
  // Desktop (>= 768px): sidebar collapses to icons only.
  readonly sidebarPinned = signal(false);
  readonly sidebarHovered = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  togglePin(): void {
    this.sidebarPinned.update((pinned) => !pinned);
    this.sidebarHovered.set(false);
  }

  setHovered(hovered: boolean): void {
    this.sidebarHovered.set(hovered);
  }
}
