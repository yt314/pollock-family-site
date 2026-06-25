import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected auth = inject(AuthService);
  protected theme = inject(ThemeService);
  protected notify = inject(NotificationService);
  private router = inject(Router);

  searchTerm = '';

  search(): void {
    const q = this.searchTerm.trim();
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
    this.searchTerm = '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
