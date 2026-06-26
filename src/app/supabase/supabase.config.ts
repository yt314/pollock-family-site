// ============================================================================
// הגדרות Supabase
//
// כדי לחבר את הפורום ל-Supabase (כך שכל המשפחה תראה אותו תוכן):
//   1. היכנס ל-https://supabase.com → New Project (חינמי).
//   2. הרץ את הסקריפט שב-supabase/schema.sql (ב-SQL Editor של הפרויקט).
//   3. ב-Project Settings → API: העתק את ה-Project URL ואת ה-anon public key.
//   4. הדבק אותם כאן למטה.
//
// כל עוד השדות ריקים — הפורום עובד מקומית (localStorage) בדיוק כמו קודם.
// ============================================================================

export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
