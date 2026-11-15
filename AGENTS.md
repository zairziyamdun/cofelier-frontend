# AGENTS.md

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4, FSD, shadcn/ui,
TanStack Query, pnpm. Комментарии и доки — на русском; идентификаторы, коммиты
и ветки — на английском.

Этот файл — главный файл правил для агентов. `CLAUDE.md` только подключает его.

**Текущий этап:** 1 — каркас (см. [docs/OVERVIEW.md](docs/OVERVIEW.md), «Этапы»).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Главное

- **Два `app`:** корневой `app/` — только роутинг Next.js (тонкие `page.tsx` и
  `layout.tsx`); `src/app/` — слой FSD (провайдеры, глобальные стили).
- **Слои FSD:** `app → views → widgets → features → entities → shared`, импорт
  только вниз; в слайс — только через его `index.ts`. Слой pages из FSD назван
  `views`, чтобы не конфликтовать с роутингом Next.js.
- **Данные сервера** — только через TanStack Query и хуки слайса; типы — только
  сгенерированные из Swagger бэкенда, руками не писать.
- **Права** решает бэкенд; на фронте скрытие кнопок — удобство, не защита.
- **После правок:** `pnpm lint`, `pnpm lint:fsd`, `pnpm format:check`,
  `pnpm typecheck`; перед PR — ещё `pnpm build`.
- Код — источник истины: если док разошёлся с кодом, док правится в том же
  коммите.
- Объём задачи не расширять молча; неоднозначность — спросить.

## Что читать

| Файл | Зачем |
| --- | --- |
| [docs/FRONTEND.md](docs/FRONTEND.md) | Как устроен код: §1 структура и слои, §2 роутинг и доступ, §3 API и кеш, §4 UI и бренд, §5 анимации, правила |
| [docs/OVERVIEW.md](docs/OVERVIEW.md) | Продукт, роли, страницы, этапы (общий с бэкендом) |
| [docs/Tech-spec.md](docs/Tech-spec.md) | Стек и версии из `package.json` |
| [docs/PR-POLICY.md](docs/PR-POLICY.md) | Правила проверки PR, их строгость и ID |

## Код

Подробно — [docs/FRONTEND.md](docs/FRONTEND.md); здесь только выжимка.

- **Роутинг** (§2): группы `(site)` и `(admin)` с разными `layout.tsx`.
  `page.tsx` в `app/` только реэкспортирует экран из `@/views/<page>`; запросов,
  состояния и разметки в нём нет.
- **Слайс** (§1): `index.ts` (публичный API) + сегменты `ui/`, `model/`, `api/`,
  `lib/`, `config/`. Глубокий импорт `@/entities/order/ui/X` — нельзя.
- **Server и Client Components** (§2): по умолчанию серверный компонент;
  `"use client"` — только там, где нужны состояние, эффекты, браузерные API,
  TanStack Query или GSAP. Директиву ставить как можно ниже по дереву.
- **HTTP** (§3): один клиент в `shared/api`, голый `fetch` в компонентах не
  писать. Cookie с JWT — `httpOnly`, токен в JS не читается и не хранится.
- **Ключи кеша** (§3): из фабрики ключей сущности, без литералов; после
  мутации — инвалидация.
- **Цвет и шрифт — только токены** (§4): `bg-background`, `text-primary`,
  `font-heading`; hex в классах не писать, нет токена — завести в
  `src/app/styles/globals.css`.
- **Классы** (§4): через `cn()` из `@/shared/lib/utils`.
- **Mobile-first** (§4): база от 320px, шаг 8px (кратно `2` в Tailwind),
  тач-цель ≥ 44px, нет горизонтального скролла.
- **shadcn/ui** (§4): компоненты в `src/shared/ui`, добавлять через
  `pnpm dlx shadcn@latest add <name>`; правка сгенерированного компонента —
  допустима, это наш код.
- **Состояния экрана:** загрузка (скелетон), пусто, ошибка; кнопка отправки
  заблокирована на время запроса.
- **GSAP** (§5): только в клиентских компонентах через `useGSAP`, с
  `ScrollTrigger` из того же хука; анимации — этап 7, раньше не делать.
- **Комментарий** — одно предложение про «почему».
- **Безопасность:** `NEXT_PUBLIC_*` попадают в бандл — секретов в них нет;
  `dangerouslySetInnerHTML` не использовать; не логировать персональные данные.

## Тесты

Пока не настроены (этап 7). Чистая логика слайса кладётся в `lib/`, чтобы
потом покрыть её тестами без браузера.

## CI и PR

- GitHub Actions (`.github/workflows/ci.yml`) на каждый PR в `main`: lint,
  lint:fsd, format:check, typecheck, build. Слияние — только после зелёного CI.
- Перед PR — скилл `/pre-pr-review`: diff от merge-base, ревью по
  [docs/PR-POLICY.md](docs/PR-POLICY.md), проверки, отчёт `READY` /
  `READY WITH WARNINGS` / `BLOCKED` / `INCOMPLETE`. С `BLOCKED` PR не создаём.
- Отклонение от правила — комментарий `policy-exception: <ID> <причина>` у
  кода и строка в разделе «Отклонения от PR Policy» описания PR.
- Локальная проверка не заменяет CI.

## Git

- В `main` не коммитить и не пушить напрямую; каждая задача — своя ветка
  (`feat/menu-page`, `fix/header-mobile`); ветку выбирает человек.
- Коммиты маленькие, на простом английском с префиксом: `feat:`, `fix:`,
  `style:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:`.
  Пример: `feat: add menu page`.
- **Без атрибуции ИИ:** без строк `Co-Authored-By` и подписей Claude в
  коммитах и PR.
- `.env*` не коммитятся; список переменных без значений — в `.env.example`.

## Команды

```bash
pnpm dev           # next dev, http://localhost:3000
pnpm build         # прод-сборка
pnpm start         # запуск сборки
pnpm lint          # eslint
pnpm lint:fsd      # steiger ./src — правила FSD
pnpm typecheck     # tsc --noEmit
pnpm format        # prettier --write (код; *.md и .claude не трогает)
pnpm format:check  # как в CI
pnpm dlx shadcn@latest add <component>   # новый компонент в src/shared/ui
```

Планируется: `pnpm gen:api` (openapi-typescript из Swagger бэкенда, этап 2).
