# Frontend — техническое устройство

Next.js 16 (App Router) + Tailwind 4 + FSD, TanStack Query, shadcn/ui. Что за
продукт — `OVERVIEW.md`, стек — `Tech-spec.md`.

В разделах помечено, что **есть** в коде и что **план** (появится на этапе N).
Когда план становится кодом — пометка снимается в том же коммите.

---

## 1. Структура

```
app/                  роутинг Next.js — page.tsx / layout.tsx / error.tsx / route.ts
  (site)/             публичный сайт: /, /menu                     (есть)
                      о нас, контакты, корзина, кабинет            (план)
  (admin)/            панель сотрудников                           (план, этап 3)
  layout.tsx          корневой layout: шрифты, <Providers>, title  (есть)
src/
  app/                слой FSD app: providers/, layouts/, styles/  (есть)
  views/              экраны страниц: home, menu                   (есть)
  widgets/            header, footer, menu-list                    (есть)
                      hero, gallery                                (план)
  features/           cart, auth-login, change-order-status        (план)
  entities/           menu-item                                    (есть)
                      order, user                                  (план)
  shared/             ui (shadcn, logo, error-state), lib, config, api (есть)
openapi/              openapi.json — копия схемы бэкенда (коммитится)
public/               статика: логотип, favicon.svg                (план)
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
`fsd/segments-by-purpose` ради сегментов `providers` и `layouts`, а везде —
`fsd/insignificant-slice`: Steiger не знает слой `views` и не видит импорты
из него, поэтому любой виджет страницы для него «без ссылок».

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
- `(site)/layout.tsx` — реэкспорт `SiteLayout` из `@/app/layouts` (шапка и
  подвал — виджеты); `(admin)/layout.tsx` — так же, боковое меню панели.
- `error.tsx` — клиентский и тонкий: `ErrorState` из `shared/ui` и
  `useQueryRetry(retry)` из `shared/api`. Реэкспортировать его из `views`
  нельзя: клиентский файл потянул бы в бандл серверный экран.
- Заголовок страницы — `metadata.title` в `page.tsx`; шаблон
  `%s — Cofelier` задан в корневом layout.
- **Доступ** (план, этап 3): JWT лежит в `httpOnly`-cookie, выданной бэкендом.
  Next.js проверяет роль на сервере (proxy/middleware или серверный layout
  `(admin)`) запросом `GET /auth/me` и делает redirect на вход. Окончательное
  решение — всегда за API: фронт не считает пользователя админом сам.
- Кнопка действия, недоступного роли, не показывается — но запрос без прав всё
  равно должен получить 403 от бэкенда.

### Server и Client Components

- По умолчанию — Server Component. `"use client"` — в листовых компонентах с
  состоянием, эффектами, браузерными API, TanStack Query, GSAP.
- Публичные страницы рендерятся на сервере ради SEO. Включён
  `cacheComponents`, поэтому загрузка данных на сервере устроена так
  (образец — `views/menu/ui/MenuPage.tsx`):
  1. экран синхронный, данные — в отдельном async-компоненте внутри
     `<Suspense fallback={<Skeleton />}>`;
  2. в нём первым делом `await connection()` — иначе Next пойдёт в API во
     время сборки и упадёт в CI без бэкенда;
  3. `prefetchQuery(xxxQueryOptions())` → `<HydrationBoundary
     state={dehydrate(queryClient)}>` → клиентский виджет с
     `useSuspenseQuery` по тем же опциям.

  Итог — частичный пререндер (`◐` в `next build`): оболочка статическая,
  данные приходят потоком на каждый запрос. Ошибка загрузки — в `error.tsx`
  сегмента.
- `new Date()` и `Math.random()` в серверных компонентах без `connection()` —
  ошибка пререндера (cacheComponents).
- Секреты и серверные адреса — только в серверном коде; клиентская переменная
  — с префиксом `NEXT_PUBLIC_` и считается публичной.

## 3. API и кеш

- **Клиент запросов** (есть: `shared/api/query-client.ts`): на сервере —
  новый `QueryClient` на каждый запрос, в браузере — один. `staleTime` 60 с.
- **HTTP** (есть): `http` из `shared/api/http.ts` — `openapi-fetch`,
  типизированный схемой: `http.GET("/api/menu")`. Базовый адрес —
  `API_URL` из `shared/config` (`NEXT_PUBLIC_API_URL`, без `/api`),
  `credentials: "include"` для cookie. `unwrap(result)` отдаёт данные или
  бросает `ApiError` с текстом бэкенда. Голого `fetch` нет.
- **Контракт** (есть): схема бэкенда лежит в `openapi/openapi.json`
  (коммитится). `pnpm sync:api` берёт свежую из `../cofelier-backend`
  (`openapi:export`, без БД) и генерирует типы; `pnpm gen:api` (и
  `postinstall`) — только генерация `shared/api/schema.gen.ts`, этот файл
  не коммитится. Типы — `ApiSchemas["XxxDto"]`; не хватает поля — правится
  DTO бэкенда и `pnpm sync:api`, а не ручной тип.
- **Запросы сущности** — в `entities/<x>/api/`: функция запроса, фабрика
  ключей `xxxKeys`, `xxxQueryOptions()` (общие для сервера и браузера) и хук
  (`usePublicMenu` → `useSuspenseQuery`). Литерал `queryKey: ["menu"]` —
  нельзя. Образец — `entities/menu-item/api/menu.queries.ts`.
- **Повтор после ошибки** — `useQueryRetry(retry)`: сначала сброс ошибок
  запросов, потом `retry()` Next; без сброса запрос с ошибкой из кеша снова
  бросит её.
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
- **Логотип** (есть, временный): `Logo` / `LogoMark` в `shared/ui/logo.tsx` —
  набросок знака в SVG; заменить на файлы готового логотипа.
- **Цена** — `formatPrice` из `entities/menu-item`: «1 500 ₸»
  (`currencyDisplay: "narrowSymbol"`, иначе ru-RU пишет «KZT»).

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
