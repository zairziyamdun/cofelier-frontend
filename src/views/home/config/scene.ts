import type { StoryModel } from "../lib/story-scene";

// Модель зерна: сжата meshopt, текстуры WebP 1K (~200 КБ). Она же летит
// в hero и пересыпается между шагами «Пути зерна».
export const BEAN_MODEL_URL = "/models/coffee-bean.glb";

// Сколько зёрен летит в фоне hero: на телефоне меньше — дешевле для GPU и батареи.
export const BEAN_COUNT = { desktop: 46, mobile: 16 } as const;

// Предметы общей сцены (lib/story-scene). flow — порядок в пути зерна:
// между соседними номерами при прокрутке пересыпаются зёрна.
export const MODELS = {
  sack: { url: "/models/sack.glb", behavior: "turn", flow: 0, yaw: -0.3 },
  roaster: {
    url: "/models/roaster.glb",
    behavior: "turn",
    flow: 1,
    yaw: 0.5,
    scale: 1.05,
  },
  canister: {
    url: "/models/canister.glb",
    behavior: "turn",
    flow: 2,
    scale: 0.9,
  },
  cup: { url: "/models/coffee-cup.glb", behavior: "turn", flow: 3, yaw: -0.4 },
  paperCup: { url: "/models/paper-cup.glb", behavior: "arrive", scale: 0.95 },
} as const satisfies Record<string, StoryModel>;

export type ModelKey = keyof typeof MODELS;
