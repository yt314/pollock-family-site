import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-wrap">
      <div class="card">
        <div class="brand">🌳</div>
        <h1>פורום משפחת פולוק</h1>
        <p class="sub">אזור פרטי לבני המשפחה בלבד</p>

        <form (ngSubmit)="submit()">
          <label>
            השם שלך
            <input name="name" [(ngModel)]="name" autocomplete="name" placeholder="איך נציג אותך?" />
          </label>
          <label>
            הסיסמה המשפחתית
            <input
              name="password"
              type="password"
              [(ngModel)]="password"
              autocomplete="current-password"
              placeholder="הסיסמה שקיבלת מההנהלה"
            />
          </label>

          @if (error()) {
            <div class="error">שם או סיסמה שגויים. נסו שוב.</div>
          }

          <button type="submit">כניסה</button>
        </form>

        <p class="note">אין לך סיסמה? פנה לאחראי הפורום במשפחה.</p>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: flex; min-height: 100dvh; align-items: center; justify-content: center; padding: 1.5rem; }
      .card {
        background: var(--card); border: 1px solid var(--line); border-radius: 16px;
        padding: 2.5rem 2rem; width: 100%; max-width: 380px; text-align: center;
        box-shadow: 0 10px 40px rgba(30, 50, 80, 0.08);
      }
      .brand { font-size: 3rem; line-height: 1; }
      h1 { font-size: 1.5rem; margin: 0.75rem 0 0.25rem; color: var(--ink); }
      .sub { color: var(--ink-soft); margin: 0 0 1.5rem; }
      form { display: flex; flex-direction: column; gap: 1rem; text-align: right; }
      label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; color: var(--ink-soft); font-weight: 500; }
      input {
        padding: 0.7rem 0.9rem; border: 1px solid var(--line); border-radius: 10px;
        font-size: 1rem; font-family: inherit; background: var(--bg-soft);
      }
      input:focus { outline: 2px solid var(--accent); border-color: var(--accent); background: var(--card); }
      button {
        margin-top: 0.5rem; padding: 0.8rem; border: 0; border-radius: 10px; cursor: pointer;
        background: var(--accent); color: #fff; font-size: 1rem; font-weight: 600; font-family: inherit;
        transition: background 0.2s;
      }
      button:hover { background: var(--accent-dark); }
      .error { background: #fdecec; color: #c0392b; padding: 0.6rem; border-radius: 8px; font-size: 0.88rem; }
      .note { margin: 1.5rem 0 0; font-size: 0.8rem; color: var(--ink-faint); }
    `,
  ],
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  password = '';
  error = signal(false);

  submit(): void {
    if (this.auth.login(this.name, this.password)) {
      this.router.navigateByUrl('/');
    } else {
      this.error.set(true);
    }
  }
}
