import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { timeAgo } from '../../utils/time';

@Component({
  selector: 'app-member',
  imports: [RouterLink],
  template: `
    <div class="page">
      <nav class="crumbs"><a routerLink="/">הפורום</a> <span>›</span> <strong>{{ name() }}</strong></nav>

      <header class="profile">
        <div class="avatar">{{ initial() }}</div>
        <div>
          <h1>{{ name() }}</h1>
          <p class="stats">
            <span>📌 {{ threads().length }} אשכולות</span>
            <span>💬 {{ posts().length }} הודעות</span>
            <span>❤️ {{ likesReceived() }} לייקים שקיבל/ה</span>
          </p>
        </div>
      </header>

      <section>
        <h2>האשכולות שפתח/ה</h2>
        @if (threads().length) {
          <ul class="list">
            @for (t of threads(); track t.id) {
              <li>
                <a [routerLink]="['/thread', t.id]">
                  <span class="title">{{ t.title }}</span>
                  <span class="meta">ב{{ forum.getForum(t.forumId)?.title }} · {{ ago(t.createdAt) }}</span>
                </a>
              </li>
            }
          </ul>
        } @else {
          <p class="empty">עדיין לא נפתחו אשכולות.</p>
        }
      </section>

      <section>
        <h2>הודעות אחרונות</h2>
        @if (posts().length) {
          <ul class="list">
            @for (p of posts().slice(0, 10); track p.id) {
              @let t = forum.getThread(p.threadId);
              @if (t) {
                <li>
                  <a [routerLink]="['/thread', t.id]">
                    <span class="snippet">{{ p.body || '🖼️ תמונה' }}</span>
                    <span class="meta">באשכול "{{ t.title }}" · {{ ago(p.createdAt) }}</span>
                  </a>
                </li>
              }
            }
          </ul>
        } @else {
          <p class="empty">עדיין אין הודעות.</p>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .page { max-width: 760px; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
      .crumbs { font-size: 0.85rem; color: var(--ink-faint); margin-bottom: 1rem; }
      .crumbs a { color: var(--accent); text-decoration: none; }
      .crumbs span { margin: 0 0.4rem; }

      .profile { display: flex; align-items: center; gap: 1rem; background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
      .avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.6rem; flex-shrink: 0; }
      .profile h1 { margin: 0; font-size: 1.4rem; color: var(--ink); }
      .stats { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; margin: 0.4rem 0 0; color: var(--ink-soft); font-size: 0.9rem; }

      section { margin-bottom: 1.75rem; }
      section h2 { font-size: 1.05rem; color: var(--ink); margin: 0 0 0.6rem; padding: 0 0.25rem; }
      .list { list-style: none; margin: 0; padding: 0; background: var(--card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
      .list li + li { border-top: 1px solid var(--line); }
      .list a { display: flex; flex-direction: column; gap: 0.15rem; padding: 0.85rem 1.25rem; text-decoration: none; color: inherit; transition: background 0.15s; }
      .list a:hover { background: var(--bg-soft); }
      .title { font-weight: 600; color: var(--ink); }
      .snippet { color: var(--ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .meta { font-size: 0.78rem; color: var(--ink-faint); }
      .empty { color: var(--ink-faint); padding: 0 0.25rem; }
    `,
  ],
})
export class Member {
  forum = inject(ForumService);
  ago = timeAgo;

  name = input.required<string>();

  threads = computed(() => this.forum.threadsByAuthor(this.name()));
  posts = computed(() => this.forum.postsByAuthor(this.name()));
  likesReceived = computed(() =>
    this.posts().reduce((sum, p) => sum + (p.likes?.length ?? 0), 0),
  );

  initial = computed(() => this.name()?.trim()?.charAt(0) ?? '?');
}
