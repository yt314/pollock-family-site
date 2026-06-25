import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ForumService } from '../../services/forum.service';

@Component({
  selector: 'app-admin',
  imports: [RouterLink],
  template: `
    <div class="page">
      <nav class="crumbs"><a routerLink="/">הפורום</a> <span>›</span> <strong>ניהול</strong></nav>

      @if (!auth.isAdmin()) {
        <div class="card warn">אזור זה מיועד למנהלים בלבד.</div>
      } @else {
        <h1>ניהול ונתונים</h1>

        <div class="card">
          <div class="stat-row">
            <div class="stat"><span class="num">{{ forum.totals().threads }}</span><span>אשכולות</span></div>
            <div class="stat"><span class="num">{{ forum.totals().posts }}</span><span>הודעות</span></div>
            <div class="stat"><span class="num">{{ forum.categories.length }}</span><span>קטגוריות</span></div>
            <div class="stat"><span class="num">{{ forum.forums.length }}</span><span>פורומים</span></div>
          </div>
        </div>

        <div class="card">
          <h2>💾 גיבוי</h2>
          <p>
            כל תוכן הפורום נשמר כרגע בדפדפן הזה בלבד. מומלץ להוריד גיבוי מדי פעם —
            כך אפשר לשחזר אם המחשב מתאפס, או להעביר את התוכן לדפדפן/מחשב אחר.
          </p>
          <button class="primary" (click)="download()">⬇️ הורדת גיבוי (JSON)</button>
        </div>

        <div class="card">
          <h2>♻️ שחזור מגיבוי</h2>
          <p class="danger-text">
            שימו לב: טעינת קובץ גיבוי <strong>תחליף את כל התוכן הקיים</strong> בדפדפן זה.
          </p>
          <label class="file-btn">
            בחירת קובץ גיבוי לשחזור
            <input type="file" accept="application/json,.json" (change)="onFile($event)" hidden />
          </label>
          @if (message()) { <div class="msg" [class.ok]="ok()">{{ message() }}</div> }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page { max-width: 720px; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
      .crumbs { font-size: 0.85rem; color: var(--ink-faint); margin-bottom: 1rem; }
      .crumbs a { color: var(--accent); text-decoration: none; }
      .crumbs span { margin: 0 0.4rem; }
      h1 { font-size: 1.5rem; color: var(--ink); margin: 0 0 1.25rem; }

      .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 1.5rem; margin-bottom: 1.25rem; }
      .card h2 { font-size: 1.1rem; margin: 0 0 0.5rem; color: var(--ink); }
      .card p { color: var(--ink-soft); margin: 0 0 1rem; line-height: 1.6; }
      .card.warn { color: var(--ink-soft); text-align: center; }

      .stat-row { display: flex; gap: 1rem; flex-wrap: wrap; }
      .stat { flex: 1; min-width: 90px; text-align: center; background: var(--bg-soft); border-radius: 10px; padding: 0.85rem; }
      .stat .num { display: block; font-size: 1.6rem; font-weight: 700; color: var(--accent); }
      .stat span:last-child { font-size: 0.8rem; color: var(--ink-faint); }

      .primary { background: var(--accent); color: #fff; border: 0; padding: 0.65rem 1.3rem; border-radius: 10px; font-family: inherit; font-weight: 600; cursor: pointer; }
      .primary:hover { background: var(--accent-dark); }
      .file-btn { display: inline-block; background: var(--card); border: 1px solid var(--accent); color: var(--accent); padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
      .file-btn:hover { background: var(--accent-bg); }
      .danger-text { color: #c0392b; }
      .msg { margin-top: 1rem; padding: 0.7rem 1rem; border-radius: 8px; background: #fdecec; color: #c0392b; font-size: 0.9rem; }
      .msg.ok { background: #e9f7ee; color: #1e7e45; }
    `,
  ],
})
export class Admin {
  forum = inject(ForumService);
  auth = inject(AuthService);

  message = signal('');
  ok = signal(false);

  download(): void {
    const blob = new Blob([this.forum.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pollock-forum-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = this.forum.importJson(reader.result as string);
      this.ok.set(success);
      this.message.set(
        success
          ? '✓ הגיבוי נטען בהצלחה. כל התוכן שוחזר.'
          : 'הקובץ אינו תקין או אינו קובץ גיבוי של הפורום.',
      );
    };
    reader.onerror = () => {
      this.ok.set(false);
      this.message.set('שגיאה בקריאת הקובץ.');
    };
    reader.readAsText(file);
    input.value = '';
  }
}
