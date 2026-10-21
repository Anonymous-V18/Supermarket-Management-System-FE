import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private roleService = inject(RoleService);

  hasRole(roleCode: string[]): boolean {
    return this.roleService.hasRole(roleCode);
  }
}
