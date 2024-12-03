import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-account',
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent {
  private roleService = inject(RoleService);

  hasRole(roleCode: string[]): boolean {
    return this.roleService.hasRole(roleCode);
  }
}
