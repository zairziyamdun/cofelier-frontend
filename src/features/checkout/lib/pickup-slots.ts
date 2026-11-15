const SLOT_MINUTES = 15;
const SLOTS_AHEAD = 8;

export type PickupSlot = { value: string; label: string };

// Время получения: ближайший кратный 15 минутам слот, не раньше чем через 15
// минут, и ещё 2 часа вперёд. Значение — ISO, пустое — «как можно скорее».
export function pickupSlots(now: Date): PickupSlot[] {
  const start = new Date(now);
  start.setSeconds(0, 0);
  const minutes = start.getMinutes() + SLOT_MINUTES;
  start.setMinutes(Math.ceil(minutes / SLOT_MINUTES) * SLOT_MINUTES);

  return Array.from({ length: SLOTS_AHEAD }, (_, index) => {
    const slot = new Date(start.getTime() + index * SLOT_MINUTES * 60_000);
    return {
      value: slot.toISOString(),
      label: `к ${slot.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`,
    };
  });
}
