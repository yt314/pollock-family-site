import { Injectable, computed, inject } from '@angular/core';
import { Thread } from '../models/forum.models';
import { AuthService } from './auth.service';
import { ForumService } from './forum.service';
import { ReadStateService } from './read-state.service';

export interface Notification {
  thread: Thread;
  lastBy: string; // מי הגיב אחרון
  at: number; // מתי
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private forum = inject(ForumService);
  private readState = inject(ReadStateService);
  private auth = inject(AuthService);

  // אשכולות שאני מעורב בהם (פתחתי או הגבתי), שבהם יש פעילות חדשה של מישהו אחר
  readonly items = computed<Notification[]>(() => {
    const me = this.auth.displayName();
    if (!me) return [];

    return this.forum
      .threads()
      .filter((t) => this.participates(t, me))
      .map((t) => ({ thread: t, lastBy: this.forum.lastPostAuthor(t.id), at: this.forum.lastActivity(t.id) }))
      .filter((n) => n.lastBy && n.lastBy !== me && this.readState.isUnread(n.thread.id, n.at))
      .sort((a, b) => b.at - a.at);
  });

  readonly count = computed(() => this.items().length);

  private participates(t: Thread, me: string): boolean {
    return t.author === me || this.forum.postsByThread(t.id).some((p) => p.author === me);
  }
}
