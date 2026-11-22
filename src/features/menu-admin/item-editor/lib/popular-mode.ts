// Режим метки «Популярно» в форме ↔ popularOverride в API (null — авто по заказам).
export type PopularMode = "auto" | "on" | "off";

export const POPULAR_MODES: { value: PopularMode; label: string }[] = [
  { value: "auto", label: "Авто" },
  { value: "on", label: "Да" },
  { value: "off", label: "Нет" },
];

export function popularModeOf(
  override: boolean | null | undefined,
): PopularMode {
  if (override === true) return "on";
  if (override === false) return "off";
  return "auto";
}

export function popularOverrideOf(mode: string): boolean | null {
  if (mode === "on") return true;
  if (mode === "off") return false;
  return null;
}
