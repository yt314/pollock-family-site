import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rules',
  imports: [RouterLink],
  template: `
    <div class="page">
      <nav class="crumbs"><a routerLink="/">הפורום</a> <span>›</span> <strong>תקנון</strong></nav>

      <article class="paper">
        <h1>תקנון הפורום המשפחתי</h1>
        <p class="lead">
          הפורום הזה הוא הבית הדיגיטלי שלנו כמשפחה. הוא נבנה כדי לקרב לבבות, לשתף שמחות
          ולעזור זה לזה. כדי שהמקום יישאר נעים ומכבד לכולם, אנו מבקשים לשמור על מספר כללים פשוטים.
        </p>

        <ol>
          <li>
            <strong>שיח מכבד תמיד.</strong>
            מתייחסים זה לזה בכבוד ובאהבה, כפי שמשפחה טובה נוהגת. מותר לחלוק על דעה — אסור לפגוע באדם.
          </li>
          <li>
            <strong>שפה נקייה.</strong>
            נשמור על לשון נקייה ומכובדת, ללא ניבולי פה, עלבונות או ביטויים פוגעניים.
          </li>
          <li>
            <strong>בלי לשון הרע ורכילות.</strong>
            לא מספרים סיפורים על אחרים, לא חולקים מידע אישי של בני משפחה ללא רשותם, ולא מנהלים "חשבונות" ישנים בפומבי.
          </li>
          <li>
            <strong>שומרים על הפרטיות של המשפחה.</strong>
            כל מה שנכתב כאן נשאר בין כותלי המשפחה. אין לשתף תכנים, תמונות או צילומי מסך מחוץ לפורום.
          </li>
          <li>
            <strong>תמונות באחריות ובטוב טעם.</strong>
            מעלים תמונות רק של מי שמסכים להופיע בהן. אם מישהו ביקש להסיר תמונה — מסירים מיד וברצון.
          </li>
          <li>
            <strong>בלי פרסומות ומסחר לא רלוונטי.</strong>
            הפורום אינו לוח מודעות מסחרי. המלצות והעברת חפצים בתוך המשפחה — מבורכות.
          </li>
          <li>
            <strong>כותבים במקום הנכון.</strong>
            פותחים אשכול בפורום המתאים לנושא, כדי שיהיה קל לכולם למצוא ולעקוב.
          </li>
          <li>
            <strong>מחלוקת? פונים בשקט.</strong>
            אם עלה ויכוח או אי-הבנה, פונים להנהלת הפורום באופן אישי במקום להמשיך בפומבי.
          </li>
        </ol>

        <p class="sign">
          תודה שאתם חלק מהמקום הזה. יחד נשמור עליו חם, מכבד ומשפחתי. ❤️<br />
          <span>— הנהלת הפורום המשפחתי</span>
        </p>
      </article>
    </div>
  `,
  styles: [
    `
      .page { max-width: 720px; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
      .crumbs { font-size: 0.85rem; color: var(--ink-faint); margin-bottom: 1rem; }
      .crumbs a { color: var(--accent); text-decoration: none; }
      .crumbs span { margin: 0 0.4rem; }
      .paper { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 2rem 2.25rem; }
      h1 { font-size: 1.6rem; color: var(--ink); margin: 0 0 1rem; }
      .lead { color: var(--ink-soft); line-height: 1.7; margin: 0 0 1.5rem; }
      ol { padding-inline-start: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
      li { color: var(--ink-soft); line-height: 1.6; }
      li strong { color: var(--ink); display: block; margin-bottom: 0.15rem; }
      .sign { margin: 2rem 0 0; padding-top: 1.5rem; border-top: 1px solid var(--line); color: var(--ink-soft); line-height: 1.8; }
      .sign span { color: var(--ink-faint); font-size: 0.9rem; }
    `,
  ],
})
export class Rules {}
