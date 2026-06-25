import { Injectable, signal } from '@angular/core';

// ----------------------------------------------------------------------------
// שער כניסה משפחתי (סיסמה משותפת + שם תצוגה).
//
// ⚠️ חשוב להבנה: זוהי שכבת גישה בצד-הלקוח בלבד, המתאימה ל-MVP ולהסתרת התוכן
// מעיניים מזדמנות. היא *אינה* תחליף לאבטחת שרת אמיתית. ראו README (סעיף
// "אבטחה ופרטיות") להגדרות הנדרשות בשרת/אירוח כדי לחסום צפייה חיצונית וסריקה.
// ----------------------------------------------------------------------------

// הסיסמה המשפחתית המשותפת. שנו אותה לערך משלכם לפני העלייה לאוויר.
const FAMILY_PASSWORD = 'tjkv dcr ycrhbh';
// סיסמת מנהל — מי שמתחבר איתה מקבל גם הרשאות ניהול (נעיצה/נעילה/מחיקה).
const ADMIN_PASSWORD = 'admin-mishpacha';

const AUTH_KEY = 'pollock-forum-auth-v1';
const NAME_KEY = 'pollock-forum-name-v1';
const ADMIN_KEY = 'pollock-forum-admin-v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal<boolean>(localStorage.getItem(AUTH_KEY) === '1');
  readonly displayName = signal<string>(localStorage.getItem(NAME_KEY) ?? '');
  readonly isAdmin = signal<boolean>(localStorage.getItem(ADMIN_KEY) === '1');

  login(name: string, password: string): boolean {
    const admin = password === ADMIN_PASSWORD;
    if ((password !== FAMILY_PASSWORD && !admin) || !name.trim()) {
      return false;
    }
    localStorage.setItem(AUTH_KEY, '1');
    localStorage.setItem(NAME_KEY, name.trim());
    localStorage.setItem(ADMIN_KEY, admin ? '1' : '0');
    this.isAuthenticated.set(true);
    this.displayName.set(name.trim());
    this.isAdmin.set(admin);
    return true;
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ADMIN_KEY);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
  }
}
