import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LayoutService } from '../../services/layout.service';
import { LogoutService } from '../../services/logout.service';
import { TokenService } from '../../services/token.service';
import { LocalStorageService } from './../../services/local-storage.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  private logoutService = inject(LogoutService);
  private tokenService = inject(TokenService);
  private localStorageService = inject(LocalStorageService);
  private router = inject(Router);
  private toastrService = inject(ToastrService);
  layoutService = inject(LayoutService);
  private toastrConfig = {
    timeOut: 3000,
    closeButton: true,
    progressBar: true,
  };
  name!: string;
  username!: string;

  ngOnInit(): void {
    this.name = this.localStorageService.get('name') ?? '';
    this.username = this.localStorageService.get('username') ?? '';
  }

  logout() {
    this.logoutService.logout().subscribe({
      next: () => {},
      complete: () => {
        this.tokenService.clearToken();
        this.router.navigate(['']);
        this.toastrService.success(
          'Đăng xuất thành công !',
          'Success !',
          this.toastrConfig
        );
      },
      error: (error: any) => {},
    });
  }
}
