# מדריך פריסה — פורום משפחת פולוק

המטרה: להעלות את הפורום לאוויר כך שיהיה **נגיש למשפחה בלבד**, חסום מגוגל ומצפייה חיצונית.

הפרויקט הוא אתר סטטי (Angular). הפלט נבנה אל `dist/pollock-family-site/browser`.

---

## שלב 1 — בנייה

```bash
npm install
npm run build
```

---

## שלב 2 — העלאה לאירוח

הקבצים בפרויקט כבר מוכנים לשני השירותים הפופולריים (שניהם חינמיים):

### אפשרות א׳ — Netlify (מומלץ, הכי פשוט)
- חבר את הריפו ל-Netlify, או גרור את תיקיית `dist/pollock-family-site/browser` ל-Netlify Drop.
- ההגדרות נלקחות אוטומטית מ-[`netlify.toml`](netlify.toml): פקודת בנייה, תיקיית פרסום,
  כותרות `X-Robots-Tag` וניתוב SPA.

### אפשרות ב׳ — Cloudflare Pages
- *Build command:* `npm run build`
- *Build output directory:* `dist/pollock-family-site/browser`
- הקבצים [`public/_headers`](public/_headers) ו-[`public/_redirects`](public/_redirects)
  מטפלים בכותרות ובניתוב ה-SPA אוטומטית.

---

## שלב 3 — חסימת צפייה חיצונית (הצעד הכי חשוב!) 🔒

תגיות ה-`noindex` ו-`robots.txt` מונעות אינדוקס בגוגל, אבל **כדי שגורם חיצוני
לא יוכל לפתוח את האתר בכלל**, צריך הגנת-סיסמה ברמת האירוח. בחר אחת:

### Cloudflare Access (חינמי, הכי מאובטח)
1. הוסף את האתר/דומיין ל-Cloudflare.
2. *Zero Trust → Access → Applications → Add an application → Self-hosted.*
3. הגדר *Policy* שמתירה רק את כתובות האימייל של בני המשפחה (Allow → Emails).
4. עכשיו כל כניסה לאתר דורשת אימות — והתוכן לא נשלח כלל למי שאינו ברשימה.

### Netlify Password (פשוט, בתוכנית Pro)
- *Site settings → Access control → Visitor access → Password protection* → הגדר סיסמה.
- חלופה חינמית: Basic Auth דרך הגדרת `Basic-Auth` ב-`_headers` (ראו תיעוד Netlify).

> למה זה חשוב: הגנת-הסיסמה של האתר עצמו (שער הכניסה ב-Angular) מסתירה את הממשק,
> אבל ההגנה ברמת האירוח חוסמת את התוכן **לפני** שהוא בכלל נשלח לדפדפן — כך גם בוטים
> וגם סקרנים לא רואים דבר. השתמש בשתי השכבות יחד.

---

## שלב 4 — היגיינת פרטיות
- אל תשתף את כתובת האתר ברשתות חברתיות או באתרים פומביים (כך גוגל לא "מגלה" אותו).
- ודא ש-HTTPS פעיל (ברירת מחדל ב-Netlify/Cloudflare).
- אם האתר הופיע אי-פעם ב-Google Search Console — הסר אותו.

---

## תזכורת: סיסמאות ומפתחות
- **סיסמה משפחתית / מנהל:** ב-[`src/app/services/auth.service.ts`](src/app/services/auth.service.ts).
- **מפתחות Supabase** (אם מחברים תוכן משותף): ב-[`src/app/supabase/supabase.config.ts`](src/app/supabase/supabase.config.ts).
  שים לב: מפתח ה-anon מיועד לצד-לקוח. ההגנה האמיתית היא שלב 3 למעלה.
