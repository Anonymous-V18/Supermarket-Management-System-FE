import {
  afterNextRender,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LayoutService } from '../../services/layout.service';
import { RoleService } from '../../services/role.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, SidebarComponent, FooterComponent, RouterOutlet],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.css',
})
export class HomeComponent {
  layoutService = inject(LayoutService);
  private router = inject(Router);
  private roleService = inject(RoleService);

  readonly isBrowserReady = signal(false);

  constructor() {
    afterNextRender(() => this.isBrowserReady.set(true));

    // Close the mobile drawer after every navigation.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(() => this.layoutService.closeSidebar());
  }

  // F2: start a new sales invoice from anywhere (cashier shortcut).
  @HostListener('document:keydown.f2', ['$event'])
  onNewInvoiceShortcut(event: Event): void {
    if (this.roleService.hasRole(['ADMIN', 'SALESMAN'])) {
      event.preventDefault();
      this.router.navigate(['/home/invoice/create']);
    }
  }
}
