# Frontend — техническое устройство

Next.js 16 (App Router) + Tailwind 4 + FSD, TanStack Query, shadcn/ui. Что за
продукт — `OVERVIEW.md`, стек — `Tech-spec.md`.

В разделах помечено, что **есть** в коде и что **план** (появится на этапе N).
Когда план становится кодом — пометка снимается в том же коммите.

---

## 1. Структура

```
app/                  роутинг Next.js — только page.tsx / layout.tsx / route.ts
  (site)/             публичный сайт и кабинет клиента       (план, этап 2)
  (admin)/            панель сотрудников                     (план, этап 3)
  layout.tsx          корневой layout: шрифты, <Providers>   (есть)
src/
  app/                слой FSD app: providers/, styles/      (есть)
  views/              экраны страниц, собранные из виджетов  (есть: home)
  widgets/            header, hero, menu, gallery, footer    (план)
  features/           cart, auth-login, change-order-status  (план)
  entities/           order, menu-item, user                 (план)
  shared/             ui (shadcn), lib, config, api          (есть)
public/               статика: логотип, favicon.svg
docs/                 документация
```

**Почему два `app`.** Next.js ищет роутер в корневом `app/` (он важнее
`src/app/`), поэтому `src/app/` свободен под слой FSD. В `src/app/` нет
`page.tsx` и `layout.tsx` — только провайдеры и стили.

### Слои

Зависимости — только вниз. Слайсы одного слоя друг друга не импортируют.

| Слой | Что можно импортировать |
| --- | --- |
| `app/` (роутинг) | `@/app`, `@/views` и при необходимости `@/shared/config` |
| `src/app` | все слои ниже |
| `views` | `widgets`, `features`, `entities`, `shared` |
| `widgets` | `features`, `entities`, `shared` |
| `features` | `entities`, `shared` |
| `entities` | `shared` (кросс-импорт сущностей — только через `@x`, см. ниже) |
| `shared` | только `shared` |

Алиас один — `@/*` → `src/*`. Проверка — Steiger (`pnpm lint:fsd`,
`steiger.config.mjs`, пресет `recommended`); в `src/app` отключено
`fsd/segments-by-purpose` ради сегмента `providers`.

### Устройство слайса

```
src/entities/menu-item/
  index.ts          публичный API: только то, что нужно снаружи
  ui/               MenuItemCard.tsx …
  model/            типы-обёртки над контрактом, zustand-стор (если нужен)
  api/              функции запросов и хуки TanStack Query, фабрика ключей
  lib/              чистые функции (форматирование цены и т.п.)
  config/           константы
```

- Снаружи — только `@/entities/menu-item`. Глубокий путь — нарушение.
- Сегмент заводится, когда в нём появляется первый файл; пустые не создавать.
- Сущности, которым нужна соседняя сущность (заказ → позиция меню), берут её
  через `@x`-реэкспорт: `entities/menu-item/@x/order.ts`.

## 2. Роутинг и доступ

- `page.tsx` — одна строка: `export { MenuPage as default } from "@/views/menu"`.
  Метаданные (`metadata`, `generateMetadata`) — тоже в `page.tsx`, данные для
  них берутся функцией из `views` или `entities`.
- `(site)/layout.tsx` — шапка и подвал сайта; `(admin)/layout.tsx` — боковое
  меню панели. Разметки самих layout — виджеты.
- **Доступ** (план, этап 3): JWT лежит в `httpOnly`-cookie, выданной бэкендом.
  Next.js проверяет роль на сервере (proxy/middleware или серверный layout
  `(admin)`) запросом `GET /auth/me` и делает redirect на вход. Окончательное
  решение — всегда за API: фронт не считает пользователя админом сам.
- Кнопка действия, недоступного роли, не показывается — но запрос без прав всё
  равно должен получить 403 от бэкенда.

### Server и Client Components

- По умолчанию — Server Component. `"use client"` — в листовых компонентах с
  состоянием, эффектами, браузерными API, TanStack Query, GSAP.
- Публичные страницы (меню, главная) рендерятся на сервере ради SEO: данные —
  `prefetchQuery` на сервере + `HydrationBoundary`, клиент подхватывает кеш.
- Секреты и серверные адреса — только в серверном коде; клиентская переменная
  — с префиксом `NEXT_PUBLIC_` и считается публичной.

## 3. API и кеш

- **Клиент запросов** (есть: `shared/api/query-client.ts`): на сервере —
  новый `QueryClient` на каждый запрос, в браузере — один. `staleTime` 60 с.
- **HTTP** (план, этап 2): одна обёртка над `fetch` в `shared/api/http.ts` —
  базовый адрес из `shared/config`, `credentials: "include"` для cookie,
  разбор ошибки в один тип `ApiError`. В компонентах голого `fetch` нет.
- **Контракт** (план, этап 2): `pnpm gen:api` берёт Swagger JSON бэкенда и
  генерирует `shared/api/schema.gen.ts` (`openapi-typescript`). Типы ответов
  берутся оттуда; не хватает поля — правится DTO бэкенда, а не ручной тип.
- **Запросы сущности** — в `entities/<x>/api/`: функция запроса, хук
  `useXxxQuery`, фабрика ключей `xxxKeys` (`all`, `list(params)`,
  `detail(id)`). Литерал `queryKey: ["menu"]` — нельзя.
- **Мутации** — в `features/<x>/api/`: хук `useXxxMutation`, в `onSuccess` —
  инвалидация всех затронутых ключей, тост — в хуке, а не в компоненте.
- **Живые обновления** (план, этап 5): панель заказов слушает WebSocket-шлюз
  бэкенда и обновляет кеш `orderKeys` (`setQueryData` / инвалидация), а не
  держит заказы в отдельном состоянии.

## 4. UI и бренд

- **Токены** (есть: `src/app/styles/globals.css`): базовые `--charcoal`,
  `--cream`, `--copper`; семантические shadcn-токены `background`,
  `foreground`, `primary`, `accent`, `muted`, `border`… Есть тёмная тема.
  В классах — только семантика: `bg-background`, `text-primary`,
  `border-border`; `text-copper` — для акцентов бренда.
- **Шрифты** (есть): `font-sans` — Manrope, `font-heading` — Playfair Display;
  подключены через `next/font` в корневом layout с кириллицей.
- **Сетка**: шаг 8px → в Tailwind значения, кратные `2` (`p-2`, `gap-4`,
  `mt-6`). Нечётные (`p-3`) — только с причиной.
- **Mobile-first**: база — 320px, брейкпоинты `sm:` `md:` `lg:` добавляют.
  В шапке на телефоне только знак, на `md:` — знак и слово.
- **shadcn/ui** (есть: стиль `base-nova`, примитивы `@base-ui/react`):
  компоненты в `src/shared/ui`, импорт `@/shared/ui/button`. Используется в
  первую очередь в админке; на публичном сайте — свои виджеты в духе бренда.
- **Классы** — через `cn()`; строки классов не склеивать шаблонами.
- **Иконки** — `lucide-react`.
- **Картинки** — `next/image` с `alt`; фото со стоков — в `public/` или
  внешним доменом из `next.config.ts`.

## 5. Анимации (этап 7)

- GSAP + `ScrollTrigger` — только в клиентских компонентах через `useGSAP`
  (`@gsap/react`), с `scope` на ref контейнера: хук сам чистит анимации.
- `gsap.registerPlugin(ScrollTrigger)` — один раз в `shared/lib/gsap.ts`.
- Three.js — отдельным клиентским компонентом через `next/dynamic` с
  `ssr: false`, чтобы не утяжелять первый экран.
- Учитывать `prefers-reduced-motion`.

---

## Правила

**Процесс**

- Код — источник истины; док правится в том же коммите, что и поведение.
- Объём задачи не расширять молча; неоднозначность — спросить.
- Сначала найти готовое (shadcn, `shared`). Абстракция — со второго случая.

**Код**

- Компонент больше 250–300 строк — делить. Компонент не объявлять внутри
  компонента. `useEffect` — последнее средство, только для внешнего мира и с
  очисткой.
- Полные имена; поля API — как в контракте, свои переменные — `camelCase`,
  компоненты — `PascalCase`, файлы компонентов — `PascalCase.tsx`.
- Комментарий — одно предложение про «почему».
- Экран с запросом обязан иметь состояния загрузки, пусто и ошибки.
- Форматирование — Prettier с настройками по умолчанию (двойные кавычки,
  `;`) и `prettier-plugin-tailwindcss` (сортировка классов); markdown не
  форматируется.

**Безопасность**

- JWT — только в `httpOnly`-cookie; в `localStorage` и JS ничего не хранить.
- `NEXT_PUBLIC_*` публичны.
- `dangerouslySetInnerHTML` — не использовать.
- Внешние ссылки — `rel="noopener noreferrer"`.

**Язык.** Комментарии и доки — русский; идентификаторы, коммиты, ветки —
английский. Тексты интерфейса — русский, прямо в JSX (мультиязычности нет).
