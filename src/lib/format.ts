const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

/** จำนวนวันที่เหลือก่อนถึงกำหนดคืน (ติดลบ = เกินกำหนด) */
export function daysLeft(dueAt: string) {
  const diff = new Date(dueAt).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export function dueLabel(dueAt: string) {
  const d = daysLeft(dueAt);
  if (d < 0) return { text: `เกินกำหนด ${Math.abs(d)} วัน`, tone: "late" as const };
  if (d === 0) return { text: "ครบกำหนดวันนี้", tone: "soon" as const };
  if (d <= 3) return { text: `เหลืออีก ${d} วัน`, tone: "soon" as const };
  return { text: `เหลืออีก ${d} วัน`, tone: "ok" as const };
}

export function isOverdue(dueAt: string) {
  return daysLeft(dueAt) < 0;
}
