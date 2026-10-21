import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'supermarket-management-system-FE';

  private router: Router = inject(Router);
  private loginService: LoginService = inject(LoginService);

  ngOnInit(): void {
    if (!this.loginService.isLoggedIn()) {
      this.router.navigate(['']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
