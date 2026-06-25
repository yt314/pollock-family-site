import { Injectable, computed, signal } from '@angular/core';
import { Category, Forum, ForumState, Post, Thread } from '../models/forum.models';
import { CATEGORIES, FORUMS, SEED_POSTS, SEED_THREADS } from '../data/seed';

const STORAGE_KEY = 'pollock-forum-state-v1';

@Injectable({ providedIn: 'root' })
export class ForumService {
  // מבנה הקטגוריות והפורומים קבוע (מגיע מקובץ ה-seed)
  readonly categories: Category[] = CATEGORIES;
  readonly forums: Forum[] = FORUMS;

  // התוכן (אשכולות ותגובות) משתנה ונשמר בדפדפן
  private readonly state = signal<ForumState>(this.load());

  readonly threads = computed(() => this.state().threads);
  readonly posts = computed(() => this.state().posts);

  private load(): ForumState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as ForumState;
      }
    } catch {
      /* התעלם — נופלים לחזרה לנתוני הזריעה */
    }
    return { threads: [...SEED_THREADS], posts: [...SEED_POSTS] };
  }

  private persist(next: ForumState): void {
    this.state.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* אחסון מלא/חסום — לא קריטי ל-MVP */
    }
  }

  // ---- שאילתות ----

  forumsByCategory(categoryId: string): Forum[] {
    return this.forums.filter((f) => f.categoryId === categoryId);
  }

  getForum(forumId: string): Forum | undefined {
    return this.forums.find((f) => f.id === forumId);
  }

  getCategory(categoryId: string): Category | undefined {
    return this.categories.find((c) => c.id === categoryId);
  }

  threadsByForum(forumId: string): Thread[] {
    return this.threads()
      .filter((t) => t.forumId === forumId)
      .sort((a, b) => {
        // אשכולות נעוצים תמיד למעלה, אחר כך לפי פעילות אחרונה
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return this.lastActivity(b.id) - this.lastActivity(a.id);
      });
  }

  getThread(threadId: string): Thread | undefined {
    return this.threads().find((t) => t.id === threadId);
  }

  // האשכולות הפעילים ביותר בכל הפורום — לפיד "אשכולות אחרונים" בדף הבית
  recentThreads(limit = 8): Thread[] {
    return [...this.threads()]
      .sort((a, b) => {
        const byActivity = this.lastActivity(b.id) - this.lastActivity(a.id);
        return byActivity !== 0 ? byActivity : b.createdAt - a.createdAt;
      })
      .slice(0, limit);
  }

  lastPostAuthor(threadId: string): string {
    const ps = this.postsByThread(threadId);
    return ps.length ? ps[ps.length - 1].author : '';
  }

  // חיפוש חופשי באשכולות — לפי כותרת או תוכן התגובות
  search(query: string): Thread[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matchingThreadIds = new Set(
      this.posts()
        .filter((p) => p.body.toLowerCase().includes(q))
        .map((p) => p.threadId),
    );
    return this.threads()
      .filter((t) => t.title.toLowerCase().includes(q) || matchingThreadIds.has(t.id))
      .sort((a, b) => this.lastActivity(b.id) - this.lastActivity(a.id));
  }

  postsByThread(threadId: string): Post[] {
    return this.posts()
      .filter((p) => p.threadId === threadId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  replyCount(threadId: string): number {
    // מספר התגובות אחרי ההודעה הפותחת
    return Math.max(0, this.postsByThread(threadId).length - 1);
  }

  lastActivity(threadId: string): number {
    const ps = this.postsByThread(threadId);
    return ps.length ? ps[ps.length - 1].createdAt : 0;
  }

  // ---- פעולות כתיבה ----

  createThread(forumId: string, title: string, author: string, body: string, image?: string): Thread {
    const thread: Thread = {
      id: 'th-' + this.uid(),
      forumId,
      title: title.trim(),
      author: author.trim(),
      createdAt: Date.now(),
    };
    const firstPost: Post = {
      id: 'po-' + this.uid(),
      threadId: thread.id,
      author: author.trim(),
      body: body.trim(),
      createdAt: thread.createdAt,
      image,
    };
    const cur = this.state();
    this.persist({
      threads: [...cur.threads, thread],
      posts: [...cur.posts, firstPost],
    });
    return thread;
  }

  addPost(threadId: string, author: string, body: string, image?: string): Post {
    const post: Post = {
      id: 'po-' + this.uid(),
      threadId,
      author: author.trim(),
      body: body.trim(),
      createdAt: Date.now(),
      image,
    };
    const cur = this.state();
    this.persist({ ...cur, posts: [...cur.posts, post] });
    return post;
  }

  // ---- פעולות ניהול (מנהל בלבד) ----

  togglePin(threadId: string): void {
    const cur = this.state();
    this.persist({
      ...cur,
      threads: cur.threads.map((t) => (t.id === threadId ? { ...t, pinned: !t.pinned } : t)),
    });
  }

  toggleLock(threadId: string): void {
    const cur = this.state();
    this.persist({
      ...cur,
      threads: cur.threads.map((t) => (t.id === threadId ? { ...t, locked: !t.locked } : t)),
    });
  }

  deleteThread(threadId: string): void {
    const cur = this.state();
    this.persist({
      threads: cur.threads.filter((t) => t.id !== threadId),
      posts: cur.posts.filter((p) => p.threadId !== threadId),
    });
  }

  deletePost(postId: string): void {
    const cur = this.state();
    this.persist({ ...cur, posts: cur.posts.filter((p) => p.id !== postId) });
  }

  incrementViews(threadId: string): void {
    const cur = this.state();
    this.persist({
      ...cur,
      threads: cur.threads.map((t) =>
        t.id === threadId ? { ...t, views: (t.views ?? 0) + 1 } : t,
      ),
    });
  }

  private uid(): string {
    return Math.random().toString(36).slice(2, 10);
  }
}
