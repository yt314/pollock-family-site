// תאריך יחסי בעברית ("לפני שעתיים", "אתמול"...)
export function timeAgo(ts: number): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (min < 1) return 'הרגע';
  if (min < 60) return `לפני ${min} דקות`;
  if (hr === 1) return 'לפני שעה';
  if (hr < 24) return `לפני ${hr} שעות`;
  if (day === 1) return 'אתמול';
  if (day < 30) return `לפני ${day} ימים`;

  return new Date(ts).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
