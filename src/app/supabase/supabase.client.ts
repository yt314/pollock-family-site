import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './supabase.config';

// קליינט יחיד לכל האפליקציה. null כשאין הגדרות — אז עובדים מקומית.
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ---- מיפוי בין שורות ה-DB (snake_case) למודלים של האפליקציה (camelCase) ----

import { Post, Thread } from '../models/forum.models';

export function rowToThread(r: Record<string, unknown>): Thread {
  return {
    id: r['id'] as string,
    forumId: r['forum_id'] as string,
    title: r['title'] as string,
    author: r['author'] as string,
    createdAt: Number(r['created_at']),
    pinned: (r['pinned'] as boolean) ?? false,
    locked: (r['locked'] as boolean) ?? false,
    views: (r['views'] as number) ?? 0,
  };
}

export function threadToRow(t: Thread): Record<string, unknown> {
  return {
    id: t.id,
    forum_id: t.forumId,
    title: t.title,
    author: t.author,
    created_at: t.createdAt,
    pinned: !!t.pinned,
    locked: !!t.locked,
    views: t.views ?? 0,
  };
}

export function rowToPost(r: Record<string, unknown>): Post {
  return {
    id: r['id'] as string,
    threadId: r['thread_id'] as string,
    author: r['author'] as string,
    body: r['body'] as string,
    createdAt: Number(r['created_at']),
    image: (r['image'] as string) ?? undefined,
    likes: (r['likes'] as string[]) ?? [],
  };
}

export function postToRow(p: Post): Record<string, unknown> {
  return {
    id: p.id,
    thread_id: p.threadId,
    author: p.author,
    body: p.body,
    created_at: p.createdAt,
    image: p.image ?? null,
    likes: p.likes ?? [],
  };
}
