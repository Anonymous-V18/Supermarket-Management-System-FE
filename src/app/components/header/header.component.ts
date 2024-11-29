import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LogoutService } from '../../services/logout.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private logoutService = inject(LogoutService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };

  logout() {
    this.logoutService.logout().subscribe({
      next: () => {},
      complete: () => {
        this.tokenService.clearToken();
        this.router.navigate(['']);
        this.toastrService.success(
          'Logout successfully !',
          'Success !',
          this.toastrConfig
        );
      },
      error: (error: any) => {},
    });
  }
}
