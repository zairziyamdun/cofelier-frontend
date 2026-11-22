// Поле «Новинка до» — дата без времени; метка держится до конца этого дня.
const NEW_BADGE_DAYS = 14;

function toDateInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Значение поля для формы: у новой позиции — через 14 дней, как на сервере.
export function newUntilInputValue(
  newUntil: string | null | undefined,
  now = new Date(),
): string {
  if (newUntil === undefined) {
    return toDateInput(new Date(now.getTime() + NEW_BADGE_DAYS * 86_400_000));
  }
  // Истёкший срок — уже не новинка; иначе поле с min=сегодня не даст сохранить.
  if (!newUntil || new Date(newUntil) <= now) return "";
  return toDateInput(new Date(newUntil));
}

// Пустое поле — не новинка.
export function newUntilFromInput(value: string): string | null {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : null;
}

export function todayInputValue(now = new Date()): string {
  return toDateInput(now);
}
