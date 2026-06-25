import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

// עוקב אחרי "מה ראיתי" לכל בן משפחה (לפי שם תצוגה) — כדי לסמן אשכולות חדשים/מעודכנים.
// נשמר ב-localStorage: { [name]: { [threadId]: lastSeenTimestamp } }

const KEY = 'pollock-forum-read-v1';

@Injectable({ providedIn: 'root' })
export class ReadStateService {
  private auth = inject(AuthService);
  private all = signal<Record<string, Record<string, number>>>(this.load());

  private load(): Record<string, Record<string, number>> {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private persist(next: Record<string, Record<string, number>>): void {
    this.all.set(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* אחסון מלא — לא קריטי */
    }
  }

  private mine = computed(() => this.all()[this.auth.displayName()] ?? {});

  // אשכול "חדש" אם הפעילות האחרונה בו מאוחרת ממה שראינו לאחרונה
  isUnread(threadId: string, lastActivity: number): boolean {
    return lastActivity > (this.mine()[threadId] ?? 0);
  }

  markSeen(threadId: string): void {
    const name = this.auth.displayName();
    if (!name) return;
    const cur = this.all();
    this.persist({
      ...cur,
      [name]: { ...(cur[name] ?? {}), [threadId]: Date.now() },
    });
  }
}
