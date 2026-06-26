-- ============================================================================
-- סכימת מסד הנתונים של הפורום המשפחתי (Supabase / PostgreSQL)
-- הרץ את כל הקובץ ב-SQL Editor של פרויקט ה-Supabase.
-- (הקטגוריות והפורומים נשארים בקוד הלקוח — כאן רק אשכולות ותגובות.)
-- ============================================================================

-- טבלת אשכולות
create table if not exists public.threads (
  id          text primary key,
  forum_id    text        not null,
  title       text        not null,
  author      text        not null,
  created_at  bigint      not null,   -- חותמת זמן במילישניות (כמו ב-Date.now())
  pinned      boolean     not null default false,
  locked      boolean     not null default false,
  views       integer     not null default 0
);

-- טבלת תגובות
create table if not exists public.posts (
  id          text primary key,
  thread_id   text        not null references public.threads(id) on delete cascade,
  author      text        not null,
  body        text        not null default '',
  created_at  bigint      not null,
  image       text,                   -- data URL של תמונה מצורפת (אופציונלי)
  likes       jsonb       not null default '[]'::jsonb   -- מערך שמות שאהבו
);

create index if not exists posts_thread_id_idx on public.posts (thread_id);

-- ----------------------------------------------------------------------------
-- אבטחה (RLS)
-- ----------------------------------------------------------------------------
-- האפליקציה מאובטחת ע"י סיסמה משפחתית בצד-הלקוח ואינה מאונדקסת בגוגל.
-- מאחר שאין כאן Supabase Auth (משתמש אישי), אנו מאפשרים גישה למפתח ה-anon.
-- ⚠️ להגנה אמיתית מפני גורם חיצוני שמשיג את ה-URL+anon key, יש להעמיד את כל
-- האתר מאחורי סיסמה ברמת האירוח (Cloudflare Access / Netlify Password) —
-- ראו README, סעיף "אבטחה ופרטיות". בעתיד אפשר לעבור ל-Supabase Auth ולהדק.

alter table public.threads enable row level security;
alter table public.posts  enable row level security;

create policy "family access - threads" on public.threads
  for all to anon, authenticated using (true) with check (true);

create policy "family access - posts" on public.posts
  for all to anon, authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- Realtime — כדי שכל המשפחה תראה עדכונים חיים
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.threads;
alter publication supabase_realtime add table public.posts;

-- ----------------------------------------------------------------------------
-- (אופציונלי) תוכן התחלתי לדוגמה — הסר את ההערות כדי להריץ
-- ----------------------------------------------------------------------------
-- insert into public.threads (id, forum_id, title, author, created_at, pinned) values
--   ('t-welcome', 'announcements', 'ברוכים הבאים לפורום המשפחתי שלנו 🎊', 'ההנהלה', extract(epoch from now())*1000, true);
-- insert into public.posts (id, thread_id, author, body, created_at) values
--   ('p-1', 't-welcome', 'ההנהלה', 'שמחים לפתוח את הבית הדיגיטלי של המשפחה!', extract(epoch from now())*1000);
