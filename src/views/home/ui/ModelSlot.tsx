import { cn } from "@/shared/lib/utils";

import type { ModelKey } from "../config/scene";

// Место 3D-модели в вёрстке. Сам блок пустой: общая сцена (lib/story-scene)
// ставит предмет поверх него. Без JS или WebGL секция остаётся с текстом.
export function ModelSlot({
  model,
  className,
}: {
  model: ModelKey;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-model-slot={model}
      // Пятно света за предметом: тёмные модели не сливаются с фоном.
      className={cn("pointer-events-none model-spot", className)}
    />
  );
}
