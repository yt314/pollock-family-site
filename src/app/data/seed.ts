import { Category, Forum, Post, Thread } from '../models/forum.models';

// מבנה הקטגוריות והפורומים שאושר.
// ניתן להוסיף/לערוך כאן בקלות — זהו "המקור היחיד לאמת" של מבנה הפורום.

export const CATEGORIES: Category[] = [
  {
    id: 'general',
    title: 'כללי וברוכים הבאים',
    icon: '🏠',
    description: 'הודעות ההנהלה, היכרות ופטפוט חופשי',
  },
  {
    id: 'simchas',
    title: 'שמחות ואירועים',
    icon: '🎉',
    description: 'מזל טוב, תיאום שבתות, חגים ואירועים משפחתיים',
  },
  {
    id: 'help',
    title: 'עזרה הדדית',
    icon: '🤝',
    description: 'בקשות עזרה, יד שנייה והמלצות על אנשי מקצוע',
  },
  {
    id: 'nostalgia',
    title: 'נוסטלגיה ושורשים',
    icon: '📖',
    description: 'אלבום המשפחה, אילן יוחסין והנצחה',
  },
  {
    id: 'hobbies',
    title: 'פינות תחביב',
    icon: '🍲',
    description: 'מתכונים משפחתיים, טיולים ואורח חיים',
  },
];

export const FORUMS: Forum[] = [
  // כללי
  { id: 'announcements', categoryId: 'general', title: 'הודעות ההנהלה', description: 'עדכונים, תקנון ושינויים באתר', icon: '📢' },
  { id: 'intro', categoryId: 'general', title: 'היכרות והצגה עצמית', description: 'חברים חדשים מציגים את עצמם וענף המשפחה שלהם', icon: '👋' },
  { id: 'chat', categoryId: 'general', title: 'קפה ופטפוט', description: 'שיחות חופשיות ומה שלא נכנס לשום מקום אחר', icon: '☕' },

  // שמחות ואירועים
  { id: 'mazaltov', categoryId: 'simchas', title: 'מזל טוב!', description: 'לידות, בר/בת מצווה, אירוסין, חתונות וסיומים', icon: '🥳' },
  { id: 'events', categoryId: 'simchas', title: 'תיאום אירועים', description: 'תאריכים, מי מגיע וחלוקת תפקידים', icon: '📅' },
  { id: 'shabbat', categoryId: 'simchas', title: 'תיאום שבתות וחגים', description: 'מי מארח, מי מגיע ותפריט משותף', icon: '🕯️' },
  { id: 'gallery', categoryId: 'simchas', title: 'גלריית תמונות', description: 'שיתוף תמונות מהאירועים שהיו', icon: '📷' },

  // עזרה הדדית
  { id: 'need-help', categoryId: 'help', title: 'דרושה עזרה', description: 'הסעות, השאלת ציוד, ייעוץ והמלצות', icon: '🆘' },
  { id: 'secondhand', categoryId: 'help', title: 'יד שנייה במשפחה', description: 'מוסרים ומחפשים בתוך המשפחה', icon: '♻️' },
  { id: 'pros', categoryId: 'help', title: 'המלצות ואנשי מקצוע', description: 'רופאים, בעלי מקצוע וספקים מומלצים', icon: '🛠️' },

  // נוסטלגיה
  { id: 'album', categoryId: 'nostalgia', title: 'אלבום המשפחה', description: 'תמונות ישנות וסיפורים מהעבר', icon: '🖼️' },
  { id: 'roots', categoryId: 'nostalgia', title: 'אילן יוחסין וסיפורי דורות', description: 'תיעוד ההיסטוריה המשפחתית', icon: '🌳' },
  { id: 'memorial', categoryId: 'nostalgia', title: 'לזכרם', description: 'הנצחה ודברים לזכר יקירים שהלכו', icon: '🕊️' },

  // תחביב
  { id: 'recipes', categoryId: 'hobbies', title: 'מתכונים משפחתיים', description: 'מתכוני סבתא ומנות לחג', icon: '🍲' },
  { id: 'trips', categoryId: 'hobbies', title: 'טיולים והמלצות', description: 'יעדים, חופשות וצימרים', icon: '🏞️' },
  { id: 'wellbeing', categoryId: 'hobbies', title: 'בריאות ואורח חיים', description: 'טיפים, ספורט ותזונה', icon: '💪' },
];

// תוכן לדוגמה כדי שהפורום לא ייראה ריק בהתחלה.
// בזמן אמת התאריכים מחושבים יחסית לרגע הטעינה הראשונה.
const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const SEED_THREADS: Thread[] = [
  { id: 't-welcome', forumId: 'announcements', title: 'ברוכים הבאים לפורום המשפחתי שלנו 🎊', author: 'ההנהלה', createdAt: now - 10 * day, pinned: true },
  { id: 't-rules', forumId: 'announcements', title: 'תקנון הפורום — נא לקרוא', author: 'ההנהלה', createdAt: now - 10 * day, pinned: true, locked: true },
  { id: 't-intro-1', forumId: 'intro', title: 'נעים להכיר — אני מענף הבכור', author: 'דוד', createdAt: now - 5 * day },
  { id: 't-shabbat-1', forumId: 'shabbat', title: 'מי מארח את שבת פרשת בהעלותך?', author: 'מרים', createdAt: now - 2 * day },
  { id: 't-recipe-1', forumId: 'recipes', title: 'הצ׳ולנט של סבתא — המתכון המקורי', author: 'רחל', createdAt: now - 1 * day },
];

export const SEED_POSTS: Post[] = [
  { id: 'p-1', threadId: 't-welcome', author: 'ההנהלה', body: 'שמחים לפתוח את הבית הדיגיטלי של המשפחה! כאן נשתף שמחות, נתאם אירועים ונשמור על קשר. מוזמנים להציג את עצמכם בפורום ההיכרות.', createdAt: now - 10 * day },
  { id: 'p-2', threadId: 't-rules', author: 'ההנהלה', body: 'אנא קראו את התקנון בעמוד התקנון (בתפריט העליון). בקצרה: שיח מכבד, שפה נקייה, ושמירה על פרטיות המשפחה.', createdAt: now - 10 * day },
  { id: 'p-3', threadId: 't-intro-1', author: 'דוד', body: 'שלום לכולם! אני דוד, הבן הבכור. נשמח להיות חלק מהקהילה כאן.', createdAt: now - 5 * day },
  { id: 'p-4', threadId: 't-shabbat-1', author: 'מרים', body: 'מתלבטים מי מארח השבת. מי פנוי? אפשר גם לחלק — מנה ראשונה אצלי, עיקרית אצל מישהו אחר.', createdAt: now - 2 * day },
  { id: 'p-5', threadId: 't-recipe-1', author: 'רחל', body: 'סוף סוף העליתי את מתכון הצ׳ולנט המסורתי. הסוד הוא בתפוחי האדמה השלמים ובבישול על אש קטנה לאורך כל הלילה.', createdAt: now - 1 * day },
];
