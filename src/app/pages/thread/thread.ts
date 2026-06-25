import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ForumService } from '../../services/forum.service';
import { ReadStateService } from '../../services/read-state.service';
import { Post } from '../../models/forum.models';
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
          <div>
            <h1 class="title">
              @if (t.pinned) { <span class="badge">📌</span> }
              @if (t.locked) { <span class="badge">🔒</span> }
              {{ t.title }}
            </h1>
            <div class="t-stats">👁 {{ t.views ?? 0 }} צפיות · 💬 {{ forum.replyCount(t.id) }} תגובות</div>
          </div>

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
                  <a class="author" [routerLink]="['/member', p.author]">{{ p.author }}</a>
                  <span class="when">{{ ago(p.createdAt) }}</span>
                  @if (first) { <span class="op-tag">פותח האשכול</span> }
                  <span class="head-controls">
                    @if (canEdit(p)) {
                      <button class="mini" (click)="startEdit(p)" title="עריכה">✎</button>
                    }
                    @if (canDelete(p, first)) {
                      <button class="mini del" (click)="removePost(p.id)" title="מחיקה">🗑</button>
                    }
                  </span>
                </div>

                @if (editingId() === p.id) {
                  <div class="edit-box">
                    <textarea [(ngModel)]="editText" rows="3"></textarea>
                    <div class="edit-actions">
                      <button (click)="saveEdit(p)">שמירה</button>
                      <button type="button" class="ghost" (click)="cancelEdit()">ביטול</button>
                    </div>
                  </div>
                } @else {
                  @if (p.body) {
                    @let parsed = parse(p.body);
                    @if (parsed.quote) { <blockquote class="quote">{{ parsed.quote }}</blockquote> }
                    @if (parsed.text) { <p class="text">{{ parsed.text }}</p> }
                  }
                  @if (p.image) { <img class="att" [src]="p.image" alt="תמונה מצורפת" /> }
                  <div class="post-foot">
                    <button
                      class="like"
                      [class.liked]="forum.hasLiked(p.id, me())"
                      (click)="forum.toggleLike(p.id, me())"
                    >
                      {{ forum.hasLiked(p.id, me()) ? '❤️' : '🤍' }}
                      @if (forum.likeCount(p.id)) { <span>{{ forum.likeCount(p.id) }}</span> }
                    </button>
                    @if (!t.locked) {
                      <button class="quote-btn" (click)="quotePost(p)">צטט</button>
                    }
                  </div>
                }
              </div>
            </article>
          }
        </div>

        @if (t.locked) {
          <div class="locked">🔒 האשכול נעול. לא ניתן להוסיף תגובות.</div>
        } @else {
          <form class="reply" (ngSubmit)="reply()">
            <h3>הוספת תגובה</h3>
            <textarea #replyBox name="reply" [(ngModel)]="text" rows="3" placeholder="כתוב תגובה מכבדת..."></textarea>

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
      .title { font-size: 1.5rem; color: var(--ink); margin: 0; }
      .title-row > div:first-child { flex: 1; }
      .t-stats { font-size: 0.8rem; color: var(--ink-faint); margin-top: 0.3rem; }
      .badge { margin-inline-end: 0.3rem; }

      .admin-bar { display: flex; gap: 0.4rem; flex-wrap: wrap; }
      .admin-bar button { font-size: 0.8rem; padding: 0.35rem 0.7rem; border: 1px solid var(--line); background: var(--card); border-radius: 8px; cursor: pointer; font-family: inherit; color: var(--ink-soft); }
      .admin-bar button:hover { border-color: var(--accent); color: var(--accent); }
      .admin-bar .danger:hover { border-color: #c0392b; color: #c0392b; }

      .posts { display: flex; flex-direction: column; gap: 0.85rem; }
      .post { display: flex; gap: 0.85rem; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 1.1rem 1.25rem; }
      .post.op { border-color: var(--accent-soft); background: var(--accent-bg); }
      .avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
      .body { flex: 1; min-width: 0; }
      .post-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; flex-wrap: wrap; }
      .author { color: var(--ink); font-weight: 700; text-decoration: none; }
      .author:hover { color: var(--accent); text-decoration: underline; }
      .when { font-size: 0.78rem; color: var(--ink-faint); }
      .op-tag { font-size: 0.7rem; background: var(--accent); color: #fff; padding: 0.1rem 0.5rem; border-radius: 20px; }
      .head-controls { margin-inline-start: auto; display: flex; gap: 0.2rem; }
      .mini { border: 0; background: transparent; cursor: pointer; font-size: 0.9rem; opacity: 0.45; padding: 0.1rem 0.3rem; border-radius: 6px; }
      .mini:hover { opacity: 1; background: var(--bg-soft); }
      .mini.del:hover { color: #c0392b; }
      .edit-box textarea { width: 100%; box-sizing: border-box; padding: 0.6rem 0.85rem; border: 1px solid var(--accent-soft); border-radius: 10px; font-family: inherit; font-size: 0.98rem; resize: vertical; }
      .edit-box textarea:focus { outline: 2px solid var(--accent); }
      .edit-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
      .edit-actions button { padding: 0.4rem 1rem; border-radius: 8px; border: 0; font-family: inherit; font-weight: 600; cursor: pointer; background: var(--accent); color: #fff; font-size: 0.85rem; }
      .edit-actions .ghost { background: transparent; color: var(--ink-soft); border: 1px solid var(--line); }
      .text { margin: 0; color: var(--ink-soft); line-height: 1.65; white-space: pre-wrap; word-wrap: break-word; }
      .att { margin-top: 0.6rem; max-width: 100%; border-radius: 10px; border: 1px solid var(--line); }
      .quote { margin: 0 0 0.6rem; padding: 0.5rem 0.85rem; border-inline-start: 3px solid var(--accent-soft); background: var(--bg-soft); border-radius: 0 8px 8px 0; color: var(--ink-faint); font-size: 0.9rem; white-space: pre-wrap; }
      .post-foot { margin-top: 0.7rem; display: flex; align-items: center; gap: 0.5rem; }
      .quote-btn { border: 1px solid var(--line); background: var(--card); border-radius: 20px; padding: 0.25rem 0.8rem; cursor: pointer; font-family: inherit; font-size: 0.85rem; color: var(--ink-soft); }
      .quote-btn:hover { border-color: var(--accent); color: var(--accent); }
      .like { display: inline-flex; align-items: center; gap: 0.3rem; border: 1px solid var(--line); background: var(--card); border-radius: 20px; padding: 0.25rem 0.7rem; cursor: pointer; font-family: inherit; font-size: 0.85rem; color: var(--ink-soft); transition: border-color 0.15s; }
      .like:hover { border-color: #e7a9b4; }
      .like.liked { border-color: #e7a9b4; background: #fdeef1; color: #c0392b; font-weight: 600; }

      .locked { margin-top: 1.5rem; text-align: center; background: #f4f4f6; color: var(--ink-faint); padding: 1rem; border-radius: 12px; }
      .reply { margin-top: 1.5rem; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 1.25rem; }
      .reply h3 { margin: 0 0 0.75rem; font-size: 1rem; color: var(--ink); }
      .reply textarea { width: 100%; box-sizing: border-box; padding: 0.7rem 0.9rem; border: 1px solid var(--line); border-radius: 10px; font-family: inherit; font-size: 0.98rem; background: var(--bg-soft); resize: vertical; }
      .reply textarea:focus { outline: 2px solid var(--accent); background: var(--card); }
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
  private readState = inject(ReadStateService);
  private router = inject(Router);

  id = input.required<string>();
  ago = timeAgo;

  thread = computed(() => this.forum.getThread(this.id()));
  posts = computed(() => this.forum.postsByThread(this.id()));
  me = this.auth.displayName;

  text = '';
  image = signal<string | null>(null);
  err = signal(false);
  private replyBox = viewChild<ElementRef<HTMLTextAreaElement>>('replyBox');

  editingId = signal<string | null>(null);
  editText = '';

  canEdit(p: Post): boolean {
    return this.me() === p.author;
  }

  canDelete(p: Post, isFirst: boolean): boolean {
    // לא מוחקים את ההודעה הפותחת (מחיקת אשכול שמורה למנהל); השאר — בעל ההודעה או מנהל
    return !isFirst && (this.me() === p.author || this.auth.isAdmin());
  }

  startEdit(p: Post): void {
    this.editingId.set(p.id);
    this.editText = p.body;
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(p: Post): void {
    if (this.editText.trim()) {
      this.forum.editPost(p.id, this.editText);
    }
    this.editingId.set(null);
  }

  removePost(postId: string): void {
    if (confirm('למחוק את התגובה?')) {
      this.forum.deletePost(postId);
    }
  }

  // סופר צפייה אחת בכל כניסה לאשכול (פעם אחת לכל מזהה במופע הזה)
  private counted = new Set<string>();
  constructor() {
    effect(() => {
      const id = this.id();
      if (id && this.forum.getThread(id) && !this.counted.has(id)) {
        this.counted.add(id);
        this.forum.incrementViews(id);
        this.readState.markSeen(id);
      }
    });
  }

  initial(name: string): string {
    return name?.trim()?.charAt(0) ?? '?';
  }

  // מפריד שורות ציטוט (שמתחילות ב-"> ") משאר תוכן התגובה
  parse(body: string): { quote: string | null; text: string } {
    const lines = body.split('\n');
    const quoteLines: string[] = [];
    let i = 0;
    while (i < lines.length && lines[i].startsWith('>')) {
      quoteLines.push(lines[i].replace(/^>\s?/, ''));
      i++;
    }
    return {
      quote: quoteLines.length ? quoteLines.join('\n') : null,
      text: lines.slice(i).join('\n').trim(),
    };
  }

  quotePost(p: Post): void {
    const snippet = this.parse(p.body).text || p.body;
    const short = snippet.length > 140 ? snippet.slice(0, 140) + '…' : snippet;
    const block = `> ${p.author} כתב/ה: ${short}`.replace(/\n/g, ' ');
    this.text = (this.text ? this.text + '\n' : '') + block + '\n\n';
    const box = this.replyBox()?.nativeElement;
    if (box) {
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      box.focus();
    }
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
