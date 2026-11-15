const timeFormat = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

// «14:30» — в часовом поясе браузера.
export function formatTime(iso: string | Date): string {
  return timeFormat.format(new Date(iso));
}

// «15 ноября, 14:30»
export function formatDateTime(iso: string | Date): string {
  return dateTimeFormat.format(new Date(iso));
}
