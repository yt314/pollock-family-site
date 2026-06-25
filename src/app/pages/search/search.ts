import { Component, computed, effect, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { timeAgo } from '../../utils/time';

@Component({
  selector: 'app-search',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">
      <nav class="crumbs"><a routerLink="/">הפורום</a> <span>›</span> <strong>חיפוש</strong></nav>

      <form class="search-box" (ngSubmit)="run()">
        <input name="q" [(ngModel)]="term" placeholder="חפש אשכול לפי כותרת או תוכן..." autofocus />
        <button type="submit">חיפוש</button>
      </form>

      @if (q()) {
        <p class="summary">
          {{ results().length }} תוצאות עבור "<strong>{{ q() }}</strong>"
        </p>

        <ul class="results">
          @for (t of results(); track t.id) {
            <li>
              <a [routerLink]="['/thread', t.id]" class="row">
                <span class="main">
                  <span class="title">{{ t.title }}</span>
                  <span class="meta">
                    ב{{ forum.getForum(t.forumId)?.title }} · מאת {{ t.author }} · {{ ago(forum.lastActivity(t.id)) }}
                  </span>
                </span>
                <span class="stat">💬 {{ forum.replyCount(t.id) }}</span>
              </a>
            </li>
          } @empty {
            <li class="empty">לא נמצאו אשכולות תואמים. נסו מילה אחרת 🙂</li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .page { max-width: 760px; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
      .crumbs { font-size: 0.85rem; color: var(--ink-faint); margin-bottom: 1rem; }
      .crumbs a { color: var(--accent); text-decoration: none; }
      .crumbs span { margin: 0 0.4rem; }

      .search-box { display: flex; gap: 0.6rem; margin-bottom: 1.5rem; }
      .search-box input { flex: 1; padding: 0.7rem 0.9rem; border: 1px solid var(--line); border-radius: 10px; font-family: inherit; font-size: 1rem; background: var(--card); }
      .search-box input:focus { outline: 2px solid var(--accent); }
      .search-box button { background: var(--accent); color: #fff; border: 0; padding: 0 1.4rem; border-radius: 10px; font-family: inherit; font-weight: 600; cursor: pointer; }
      .search-box button:hover { background: var(--accent-dark); }

      .summary { color: var(--ink-soft); margin: 0 0 1rem; }
      .results { list-style: none; margin: 0; padding: 0; background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
      .results li + li { border-top: 1px solid var(--line); }
      .row { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; text-decoration: none; color: inherit; transition: background 0.15s; }
      .row:hover { background: var(--bg-soft); }
      .main { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 0.15rem; }
      .title { font-weight: 600; color: var(--ink); }
      .meta { font-size: 0.8rem; color: var(--ink-faint); }
      .stat { font-size: 0.85rem; color: var(--ink-soft); white-space: nowrap; }
      .empty { padding: 2rem; text-align: center; color: var(--ink-faint); }
    `,
  ],
})
export class Search {
  forum = inject(ForumService);
  private router = inject(Router);
  ago = timeAgo;

  // הערך מגיע מפרמטר הכתובת ?q=...
  q = input('');
  term = '';

  results = computed(() => this.forum.search(this.q()));

  constructor() {
    // משקף את החיפוש הפעיל (מהכתובת) אל תיבת החיפוש
    effect(() => {
      this.term = this.q();
    });
  }

  run(): void {
    this.router.navigate(['/search'], { queryParams: { q: this.term.trim() } });
  }
}
