import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ForumService } from '../../services/forum.service';
import { fileToResizedDataUrl } from '../../utils/image';
import { timeAgo } from '../../utils/time';

@Component({
  selector: 'app-thread',
  imports: [RouterLink, FormsModule],
  template: `
    @let t = thread();
    @if (t) {
      @let f = forum.getForum(t.forumId);
      <div class="page">
        <nav class="crumbs">
          <a routerLink="/">הפורום</a> <span>›</span>
          <a [routerLink]="['/forum', t.forumId]">{{ f?.title }}</a> <span>›</span>
          <strong>{{ t.title }}</strong>
        </nav>

        <div class="title-row">
          <h1 class="title">
            @if (t.pinned) { <span class="badge">📌</span> }
            @if (t.locked) { <span class="badge">🔒</span> }
            {{ t.title }}
          </h1>

          @if (auth.isAdmin()) {
            <div class="admin-bar">
              <button (click)="forum.togglePin(t.id)">{{ t.pinned ? 'בטל נעיצה' : 'נעץ' }}</button>
              <button (click)="forum.toggleLock(t.id)">{{ t.locked ? 'בטל נעילה' : 'נעל' }}</button>
              <button class="danger" (click)="removeThread(t.id)">מחק אשכול</button>
            </div>
          }
        </div>

        <div class="posts">
          @for (p of posts(); track p.id; let first = $first) {
            <article class="post" [class.op]="first">
              <div class="avatar">{{ initial(p.author) }}</div>
              <div class="body">
                <div class="post-head">
                  <strong>{{ p.author }}</strong>
                  <span class="when">{{ ago(p.createdAt) }}</span>
                  @if (first) { <span class="op-tag">פותח האשכול</span> }
                  @if (auth.isAdmin() && !first) {
                    <button class="del-post" (click)="forum.deletePost(p.id)" title="מחק תגובה">🗑</button>
                  }
                </div>
                @if (p.body) { <p class="text">{{ p.body }}</p> }
                @if (p.image) { <img class="att" [src]="p.image" alt="תמונה מצורפת" /> }
              </div>
            </article>
          }
        </div>

        @if (t.locked) {
          <div class="locked">🔒 האשכול נעול. לא ניתן להוסיף תגובות.</div>
        } @else {
          <form class="reply" (ngSubmit)="reply()">
            <h3>הוספת תגובה</h3>
            <textarea name="reply" [(ngModel)]="text" rows="3" placeholder="כתוב תגובה מכבדת..."></textarea>

            <div class="reply-tools">
              <label class="file-btn">
                📷 צרף תמונה
                <input type="file" accept="image/*" (change)="onFile($event)" hidden />
              </label>
              @if (image()) {
                <span class="file-name">תמונה נבחרה ✓</span>
                <button type="button" class="clear" (click)="clearImage()">הסר</button>
              }
            </div>

            @if (image()) { <img class="preview" [src]="image()!" alt="תצוגה מקדימה" /> }
            @if (err()) { <div class="err">נא לכתוב תוכן או לצרף תמונה.</div> }
            <button type="submit">שליחה</button>
          </form>
        }
      </div>
    } @else {
      <div class="page"><p>האשכול לא נמצא. <a routerLink="/">חזרה לעמוד הראשי</a></p></div>
    }
  `,
  styles: [
    `
      .page { max-width: 760px; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
      .crumbs { font-size: 0.85rem; color: var(--ink-faint); margin-bottom: 1rem; }
      .crumbs a { color: var(--accent); text-decoration: none; }
      .crumbs span { margin: 0 0.4rem; }
      .title-row { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
      .title { font-size: 1.5rem; color: var(--ink); margin: 0; flex: 1; }
      .badge { margin-inline-end: 0.3rem; }

      .admin-bar { display: flex; gap: 0.4rem; flex-wrap: wrap; }
      .admin-bar button { font-size: 0.8rem; padding: 0.35rem 0.7rem; border: 1px solid var(--line); background: #fff; border-radius: 8px; cursor: pointer; font-family: inherit; color: var(--ink-soft); }
      .admin-bar button:hover { border-color: var(--accent); color: var(--accent); }
      .admin-bar .danger:hover { border-color: #c0392b; color: #c0392b; }

      .posts { display: flex; flex-direction: column; gap: 0.85rem; }
      .post { display: flex; gap: 0.85rem; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 1.1rem 1.25rem; }
      .post.op { border-color: var(--accent-soft); background: var(--accent-bg); }
      .avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
      .body { flex: 1; min-width: 0; }
      .post-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; flex-wrap: wrap; }
      .post-head strong { color: var(--ink); }
      .when { font-size: 0.78rem; color: var(--ink-faint); }
      .op-tag { font-size: 0.7rem; background: var(--accent); color: #fff; padding: 0.1rem 0.5rem; border-radius: 20px; }
      .del-post { margin-inline-start: auto; border: 0; background: transparent; cursor: pointer; font-size: 0.9rem; opacity: 0.5; }
      .del-post:hover { opacity: 1; }
      .text { margin: 0; color: var(--ink-soft); line-height: 1.65; white-space: pre-wrap; word-wrap: break-word; }
      .att { margin-top: 0.6rem; max-width: 100%; border-radius: 10px; border: 1px solid var(--line); }

      .locked { margin-top: 1.5rem; text-align: center; background: #f4f4f6; color: var(--ink-faint); padding: 1rem; border-radius: 12px; }
      .reply { margin-top: 1.5rem; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 1.25rem; }
      .reply h3 { margin: 0 0 0.75rem; font-size: 1rem; color: var(--ink); }
      .reply textarea { width: 100%; box-sizing: border-box; padding: 0.7rem 0.9rem; border: 1px solid var(--line); border-radius: 10px; font-family: inherit; font-size: 0.98rem; background: var(--bg-soft); resize: vertical; }
      .reply textarea:focus { outline: 2px solid var(--accent); background: #fff; }
      .reply-tools { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.6rem; }
      .file-btn { font-size: 0.85rem; color: var(--accent); cursor: pointer; font-weight: 600; }
      .file-name { font-size: 0.82rem; color: var(--ink-faint); }
      .clear { border: 0; background: transparent; color: #c0392b; cursor: pointer; font-size: 0.82rem; font-family: inherit; }
      .preview { margin-top: 0.75rem; max-width: 220px; border-radius: 10px; border: 1px solid var(--line); display: block; }
      .reply > button[type='submit'] { margin-top: 0.75rem; background: var(--accent); color: #fff; border: 0; padding: 0.6rem 1.4rem; border-radius: 10px; font-family: inherit; font-weight: 600; cursor: pointer; }
      .reply > button[type='submit']:hover { background: var(--accent-dark); }
      .err { color: #c0392b; font-size: 0.85rem; margin-top: 0.5rem; }
    `,
  ],
})
export class Thread {
  forum = inject(ForumService);
  auth = inject(AuthService);
  private router = inject(Router);

  id = input.required<string>();
  ago = timeAgo;

  thread = computed(() => this.forum.getThread(this.id()));
  posts = computed(() => this.forum.postsByThread(this.id()));

  text = '';
  image = signal<string | null>(null);
  err = signal(false);

  initial(name: string): string {
    return name?.trim()?.charAt(0) ?? '?';
  }

  async onFile(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      this.image.set(await fileToResizedDataUrl(file));
    } catch {
      this.err.set(true);
    }
  }

  clearImage(): void {
    this.image.set(null);
  }

  reply(): void {
    if (!this.text.trim() && !this.image()) {
      this.err.set(true);
      return;
    }
    this.forum.addPost(this.id(), this.auth.displayName(), this.text, this.image() ?? undefined);
    this.text = '';
    this.image.set(null);
    this.err.set(false);
  }

  removeThread(threadId: string): void {
    if (confirm('למחוק את האשכול וכל התגובות בו? פעולה זו אינה הפיכה.')) {
      this.forum.deleteThread(threadId);
      const f = this.thread()?.forumId;
      this.router.navigate(['/forum', f]);
    }
  }
}
