import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ForumService } from '../../services/forum.service';
import { fileToResizedDataUrl } from '../../utils/image';
import { timeAgo } from '../../utils/time';

@Component({
  selector: 'app-forum',
  imports: [RouterLink, FormsModule],
  template: `
    @let f = forumDef();
    @if (f) {
      <div class="page">
        <nav class="crumbs">
          <a routerLink="/">הפורום</a> <span>›</span> <strong>{{ f.title }}</strong>
        </nav>

        <header class="head">
          <span class="icon">{{ f.icon }}</span>
          <div>
            <h1>{{ f.title }}</h1>
            <p>{{ f.description }}</p>
          </div>
          <button class="new-btn" (click)="toggleForm()">+ אשכול חדש</button>
        </header>

        @if (showForm()) {
          <form class="new-thread" (ngSubmit)="create()">
            <input name="title" [(ngModel)]="title" placeholder="כותרת האשכול" />
            <textarea name="body" [(ngModel)]="body" rows="4" placeholder="מה תרצה לכתוב?"></textarea>

            <div class="tools">
              <label class="file-btn">
                📷 צרף תמונה
                <input type="file" accept="image/*" (change)="onFile($event)" hidden />
              </label>
              @if (image()) {
                <span class="file-name">תמונה נבחרה ✓</span>
                <button type="button" class="clear" (click)="image.set(null)">הסר</button>
              }
            </div>
            @if (image()) { <img class="preview" [src]="image()!" alt="תצוגה מקדימה" /> }

            @if (formError()) { <div class="err">נא למלא כותרת ותוכן.</div> }
            <div class="actions">
              <button type="submit">פרסום</button>
              <button type="button" class="ghost" (click)="toggleForm()">ביטול</button>
            </div>
          </form>
        }

        <ul class="threads">
          @for (t of threads(); track t.id) {
            <li>
              <a [routerLink]="['/thread', t.id]" class="thread-row">
                <span class="t-main">
                  @if (t.pinned) { <span class="badge">📌 נעוץ</span> }
                  @if (t.locked) { <span class="badge lock">🔒 נעול</span> }
                  <span class="t-title">{{ t.title }}</span>
                  <span class="t-meta">
                    פתח/ה {{ t.author }} · 👁 {{ t.views ?? 0 }} · תגובה אחרונה {{ ago(forum.lastActivity(t.id)) }}
                    @if (forum.replyCount(t.id)) { · מאת {{ forum.lastPostAuthor(t.id) }} }
                  </span>
                </span>
                <span class="t-replies">
                  <span class="num">{{ forum.replyCount(t.id) }}</span>
                  <span class="lbl">תגובות</span>
                </span>
              </a>
            </li>
          } @empty {
            <li class="empty">עדיין אין אשכולות כאן. היו הראשונים לפתוח דיון! 🙂</li>
          }
        </ul>
      </div>
    } @else {
      <div class="page"><p>הפורום לא נמצא. <a routerLink="/">חזרה לעמוד הראשי</a></p></div>
    }
  `,
  styles: [
    `
      .page { max-width: 880px; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
      .crumbs { font-size: 0.85rem; color: var(--ink-faint); margin-bottom: 1rem; }
      .crumbs a { color: var(--accent); text-decoration: none; }
      .crumbs span { margin: 0 0.4rem; }

      .head { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem; }
      .head .icon { font-size: 2rem; }
      .head h1 { font-size: 1.4rem; margin: 0; color: var(--ink); }
      .head p { font-size: 0.88rem; color: var(--ink-faint); margin: 0.15rem 0 0; }
      .new-btn { margin-inline-start: auto; background: var(--accent); color: #fff; border: 0; padding: 0.6rem 1rem; border-radius: 10px; font-family: inherit; font-weight: 600; cursor: pointer; white-space: nowrap; }
      .new-btn:hover { background: var(--accent-dark); }

      .new-thread { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 1.25rem; margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
      .new-thread input, .new-thread textarea { padding: 0.65rem 0.85rem; border: 1px solid var(--line); border-radius: 10px; font-family: inherit; font-size: 0.98rem; background: var(--bg-soft); resize: vertical; }
      .new-thread input:focus, .new-thread textarea:focus { outline: 2px solid var(--accent); background: #fff; }
      .actions { display: flex; gap: 0.6rem; }
      .actions button { padding: 0.55rem 1.1rem; border-radius: 9px; border: 0; font-family: inherit; font-weight: 600; cursor: pointer; }
      .actions button[type='submit'] { background: var(--accent); color: #fff; }
      .actions .ghost { background: transparent; color: var(--ink-soft); border: 1px solid var(--line); }
      .tools { display: flex; align-items: center; gap: 0.75rem; }
      .file-btn { font-size: 0.85rem; color: var(--accent); cursor: pointer; font-weight: 600; }
      .file-name { font-size: 0.82rem; color: var(--ink-faint); }
      .clear { border: 0; background: transparent; color: #c0392b; cursor: pointer; font-size: 0.82rem; font-family: inherit; }
      .preview { max-width: 220px; border-radius: 10px; border: 1px solid var(--line); display: block; }
      .err { color: #c0392b; font-size: 0.85rem; }

      .threads { list-style: none; margin: 0; padding: 0; background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
      .threads li + li { border-top: 1px solid var(--line); }
      .thread-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; text-decoration: none; color: inherit; transition: background 0.15s; }
      .thread-row:hover { background: var(--bg-soft); }
      .t-main { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 0.15rem; }
      .t-title { font-weight: 600; color: var(--ink); }
      .t-meta { font-size: 0.8rem; color: var(--ink-faint); }
      .badge { display: inline-block; font-size: 0.72rem; color: var(--accent); font-weight: 600; margin-inline-end: 0.4rem; }
      .badge.lock { color: var(--ink-faint); }
      .t-replies { text-align: center; min-width: 56px; }
      .t-replies .num { display: block; font-weight: 700; color: var(--accent); }
      .t-replies .lbl { font-size: 0.7rem; color: var(--ink-faint); }
      .empty { padding: 2rem; text-align: center; color: var(--ink-faint); }
    `,
  ],
})
export class Forum {
  forum = inject(ForumService);
  private auth = inject(AuthService);
  private router = inject(Router);

  id = input.required<string>();
  ago = timeAgo;

  forumDef = computed(() => this.forum.getForum(this.id()));
  threads = computed(() => this.forum.threadsByForum(this.id()));

  showForm = signal(false);
  formError = signal(false);
  image = signal<string | null>(null);
  title = '';
  body = '';

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.formError.set(false);
  }

  async onFile(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      this.image.set(await fileToResizedDataUrl(file));
    } catch {
      this.formError.set(true);
    }
  }

  create(): void {
    if (!this.title.trim() || !this.body.trim()) {
      this.formError.set(true);
      return;
    }
    const t = this.forum.createThread(
      this.id(),
      this.title,
      this.auth.displayName(),
      this.body,
      this.image() ?? undefined,
    );
    this.title = '';
    this.body = '';
    this.image.set(null);
    this.showForm.set(false);
    this.router.navigate(['/thread', t.id]);
  }
}
