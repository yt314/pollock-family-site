import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { NotificationService } from '../../services/notification.service';
import { timeAgo } from '../../utils/time';

@Component({
  selector: 'app-notifications',
  imports: [RouterLink],
  template: `
    <div class="page">
      <nav class="crumbs"><a routerLink="/">הפורום</a> <span>›</span> <strong>התראות</strong></nav>
      <h1>🔔 ההתראות שלך</h1>

      @if (notify.items().length) {
        <ul class="list">
          @for (n of notify.items(); track n.thread.id) {
            <li>
              <a [routerLink]="['/thread', n.thread.id]">
                <span class="avatar">{{ initial(n.lastBy) }}</span>
                <span class="main">
                  <span class="text"><strong>{{ n.lastBy }}</strong> הגיב/ה באשכול "{{ n.thread.title }}"</span>
                  <span class="meta">ב{{ forum.getForum(n.thread.forumId)?.title }} · {{ ago(n.at) }}</span>
                </span>
                <span class="dot"></span>
              </a>
            </li>
          }
        </ul>
      } @else {
        <div class="empty">
          <div class="big">🎉</div>
          <p>אין התראות חדשות. כל הכבוד, אתה מעודכן!</p>
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

      .list { list-style: none; margin: 0; padding: 0; background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
      .list li + li { border-top: 1px solid var(--line); }
      .list a { display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.25rem; text-decoration: none; color: inherit; transition: background 0.15s; }
      .list a:hover { background: var(--bg-soft); }
      .avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
      .main { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 0.15rem; }
      .text { color: var(--ink); }
      .meta { font-size: 0.78rem; color: var(--ink-faint); }
      .dot { width: 10px; height: 10px; border-radius: 50%; background: #e23b3b; flex-shrink: 0; }

      .empty { text-align: center; padding: 3rem 1rem; color: var(--ink-faint); }
      .empty .big { font-size: 3rem; }
    `,
  ],
})
export class Notifications {
  notify = inject(NotificationService);
  forum = inject(ForumService);
  ago = timeAgo;

  initial(name: string): string {
    return name?.trim()?.charAt(0) ?? '?';
  }
}
