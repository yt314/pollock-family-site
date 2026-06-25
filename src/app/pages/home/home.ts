import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { ReadStateService } from '../../services/read-state.service';
import { timeAgo } from '../../utils/time';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="page">
      <header class="hero">
        <h1>הפורום המשפחתי</h1>
        <p>הבית הדיגיטלי של המשפחה — לשמחות, לתיאום ולשמירה על קשר.</p>
      </header>

      @if (recent().length) {
        <section class="recent">
          <h2 class="recent-title">🕒 אשכולות אחרונים</h2>
          <ul class="recent-list">
            @for (t of recent(); track t.id) {
              <li>
                <a [routerLink]="['/thread', t.id]" class="recent-row">
                  <span class="r-main">
                    <span class="r-title">
                      @if (readState.isUnread(t.id, forum.lastActivity(t.id))) {
                        <span class="new-badge">חדש</span>
                      }
                      {{ t.title }}
                    </span>
                    <span class="r-meta">
                      ב{{ forum.getForum(t.forumId)?.title }} ·
                      תגובה אחרונה מאת {{ forum.lastPostAuthor(t.id) }} · {{ timeAgo(forum.lastActivity(t.id)) }}
                    </span>
                  </span>
                  <span class="r-replies">{{ forum.replyCount(t.id) }} 💬</span>
                </a>
              </li>
            }
          </ul>
        </section>
      }

      @for (cat of forum.categories; track cat.id) {
        <section class="category">
          <div class="cat-head">
            <span class="cat-icon">{{ cat.icon }}</span>
            <div>
              <h2>{{ cat.title }}</h2>
              <p>{{ cat.description }}</p>
            </div>
          </div>

          <ul class="forum-list">
            @for (f of forum.forumsByCategory(cat.id); track f.id) {
              <li>
                <a [routerLink]="['/forum', f.id]" class="forum-row">
                  <span class="f-icon">{{ f.icon }}</span>
                  <span class="f-text">
                    <span class="f-title">
                      {{ f.title }}
                      @if (unreadInForum(f.id); as n) { <span class="new-count">{{ n }} חדש</span> }
                    </span>
                    <span class="f-desc">{{ f.description }}</span>
                  </span>
                  <span class="f-stats">
                    <span class="count">{{ forum.threadsByForum(f.id).length }}</span>
                    <span class="count-label">אשכולות</span>
                  </span>
                </a>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .page { max-width: 880px; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
      .hero { text-align: center; margin: 1rem 0 2.5rem; }
      .hero h1 { font-size: 2rem; color: var(--ink); margin: 0 0 0.4rem; }
      .hero p { color: var(--ink-soft); margin: 0; }

      .recent { margin-bottom: 2.5rem; }
      .recent-title { font-size: 1.05rem; color: var(--ink); margin: 0 0 0.75rem; padding: 0 0.25rem; }
      .recent-list { list-style: none; margin: 0; padding: 0; background: var(--accent-bg); border: 1px solid var(--accent-soft); border-radius: 14px; overflow: hidden; }
      .recent-list li + li { border-top: 1px solid var(--accent-soft); }
      .recent-row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1.25rem; text-decoration: none; color: inherit; transition: background 0.15s; }
      .recent-row:hover { background: color-mix(in srgb, var(--accent) 12%, transparent); }
      .r-main { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 0.15rem; }
      .r-title { font-weight: 600; color: var(--ink); }
      .r-meta { font-size: 0.78rem; color: var(--ink-faint); }
      .r-replies { font-size: 0.8rem; color: var(--ink-soft); white-space: nowrap; }
      .new-badge { background: #e23b3b; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 0.05rem 0.4rem; border-radius: 20px; margin-inline-end: 0.35rem; }
      .new-count { background: #e23b3b; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 0.05rem 0.45rem; border-radius: 20px; margin-inline-start: 0.45rem; }

      .category { margin-bottom: 2rem; }
      .cat-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; padding: 0 0.25rem; }
      .cat-icon { font-size: 1.6rem; }
      .cat-head h2 { font-size: 1.15rem; margin: 0; color: var(--ink); }
      .cat-head p { font-size: 0.85rem; color: var(--ink-faint); margin: 0.1rem 0 0; }

      .forum-list { list-style: none; margin: 0; padding: 0; background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
      .forum-list li + li { border-top: 1px solid var(--line); }
      .forum-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; text-decoration: none; color: inherit; transition: background 0.15s; }
      .forum-row:hover { background: var(--bg-soft); }
      .f-icon { font-size: 1.5rem; flex-shrink: 0; }
      .f-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
      .f-title { font-weight: 600; color: var(--ink); }
      .f-desc { font-size: 0.85rem; color: var(--ink-faint); }
      .f-stats { text-align: center; flex-shrink: 0; min-width: 56px; }
      .count { display: block; font-weight: 700; color: var(--accent); font-size: 1.1rem; }
      .count-label { font-size: 0.7rem; color: var(--ink-faint); }
    `,
  ],
})
export class Home {
  forum = inject(ForumService);
  readState = inject(ReadStateService);
  timeAgo = timeAgo;

  recent = computed(() => this.forum.recentThreads(6));

  unreadInForum(forumId: string): number {
    return this.forum
      .threadsByForum(forumId)
      .filter((t) => this.readState.isUnread(t.id, this.forum.lastActivity(t.id))).length;
  }
}
