import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

// Линтер правил FSD для src/. Корневой app/ — роутинг Next.js, вне FSD.
export default defineConfig([
  ...fsd.configs.recommended,
  {
    // app/providers — принятое в FSD имя сегмента слоя app.
    files: ["./src/app/**"],
    rules: { "fsd/segments-by-purpose": "off" },
  },
]);
