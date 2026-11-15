---
name: pre-pr-review
description: Проверка ветки перед PR в main по PR Policy Cofelier (docs/PR-POLICY.md) — diff от merge-base, ревью архитектуры FSD и логики изменений со сквозной проверкой связанного кода, lint, typecheck, build, отчёт READY / READY WITH WARNINGS / BLOCKED / INCOMPLETE. Используй перед созданием PR и на просьбы «проверь ветку перед PR», «готово ли к PR», «pre-PR review».
argument-hint: "[base-branch]"
allowed-tools: Read, Grep, Glob, Write, Bash(git diff *), Bash(git log *), Bash(git show *), Bash(git status *), Bash(git merge-base *), Bash(git rev-parse *), Bash(git grep *), Bash(git fetch *), Bash(pnpm lint*), Bash(pnpm format:check*), Bash(pnpm typecheck*), Bash(pnpm build*), Bash(pnpm install*)
---

# Pre-PR review

Проверка ветки перед PR по `docs/PR-POLICY.md`. Итог — отчёт со статусом
`READY`, `READY WITH WARNINGS`, `BLOCKED` или `INCOMPLETE`. Скилл ничего не
коммитит, не пушит и не создаёт PR; код правит только по просьбе после отчёта.
Локальная проверка не заменяет CI.

## 1. Факты о ветке

Base — из аргумента (`$ARGUMENTS`), по умолчанию `main`.

```
git fetch origin
git rev-parse --abbrev-ref HEAD
git merge-base HEAD origin/<base>
git log --oneline <merge-base>..HEAD
git diff --stat <merge-base>..HEAD
git status --short
```

- Текущая ветка — `main` — сразу `BLOCKED` (G-5): работа идёт в своей ветке.
- Незакоммиченные изменения кода — скажи сразу: статус будет не выше
  `INCOMPLETE`; предложи закоммитить и повторить.
- Ветка отстаёт от `origin/<base>` — отметь: нужен rebase, проверки после
  него повторить.
- Коммиты без префикса (`feat:`, `fix:`, …) или с `Co-Authored-By` — WARNING
  G-5.
- Размеры: для каждого изменённого `.tsx`/`.ts` в `src/` и `app/` — число
  строк (FE-SIZE-1).

## 2. Правила

Прочитай `docs/PR-POLICY.md` целиком и
`.claude/skills/pre-pr-review/review-checklist.md`; `AGENTS.md` — если его нет
в контексте. Разделы `docs/FRONTEND.md` — только по темам, которые задевает
diff. Правила применяются к **добавленным и изменённым строкам**.

## 3. Проверки — в фоне, пока идёт ревью

Одной фоновой цепочкой (`run_in_background`), по порядку, не параллельно:

| id | Команда | Когда | Обязательна |
| --- | --- | --- | --- |
| install | `pnpm install --frozen-lockfile` | всегда первой | да |
| lint | `pnpm lint` | всегда | да |
| fsd | `pnpm lint:fsd` | всегда | да |
| format | `pnpm format:check` | всегда | да |
| typecheck | `pnpm typecheck` | всегда | да |
| build | `pnpm build` | всегда (как в CI) | да |

Сразу переходи к ревью (шаг 4); результат цепочки придёт уведомлением.

Упала проверка — открой вывод и раздели:

- **из-за изменений** (ошибка в изменённом файле или его потребителе) —
  `FAIL`, это BLOCKER G-4;
- **окружение** (сеть, нет зависимостей) — `ENV_ERROR` с причиной → статус
  не выше `INCOMPLETE`;
- **падало и до ветки** — только с доказательством (та же ошибка на
  merge-base) → `PRE_EXISTING`, одно WARNING. Без доказательства — `FAIL`.

`PASS` — только если команда реально отработала с кодом 0. Не запущено —
`NOT RUN`, не «скорее всего ок».

## 4. Ревью изменений

`git diff <merge-base>..HEAD`. Изменённый файл читай целиком вокруг правки,
а не только hunk.

**Большой diff** (больше ~400 строк или больше трёх слайсов) — раздай слайсы
свежим субагентам (`Agent`, general-purpose, параллельно): диапазон, список
файлов, пути к `docs/PR-POLICY.md` и `review-checklist.md`, задача «найти
нарушения политики и логические ошибки в изменённых строках: файл:строка,
доказательство, сценарий, severity». Свои выводы не передавай; их находки
проверяешь сам (шаг 5).

Обязательно сквозное:

- **потребители** изменённых `index.ts` слайсов и `shared/` (`git grep`): не
  сломался ли другой экран;
- **кеш**: после мутации обновляются все экраны с этими данными;
- **сценарий** от маршрута до запроса: роль, redirect, состояния
  загрузки/пусто/ошибка, повторная отправка;
- **контракт**: тронуты типы API — есть ли эти ручки и поля в бэкенде
  (`../cofelier-backend`, ветка `main`). Нет доступа — «Не проверено».

## 5. Верификация находок

- **BLOCKER** — только доказанное: цитата строки + ID правила, или сценарий
  «действие/состояние → неверный результат».
- Предположение без сценария — **WARNING** «риск, не доказано».
- Одна причина — одно замечание со всеми местами и ID.
- SUGGESTION — не больше пяти.
- `policy-exception: <ID> <причина>` у кода — принятое отклонение, не
  BLOCKER; пустая причина — WARNING.
- Без общих слов: «компонент делает много» — не замечание; «`X.tsx` и
  грузит меню, и считает корзину, и шлёт заказ — 3 запроса в компоненте» —
  замечание.

## 6. Статус и отчёт

Итог — худшее из проверок и ревью:

| Статус | Когда |
| --- | --- |
| `BLOCKED` | есть BLOCKER или проверка упала из-за изменений |
| `INCOMPLETE` | обязательная проверка не запущена / ENV_ERROR / незакоммиченный код |
| `READY WITH WARNINGS` | нет BLOCKER, всё обязательное прошло, есть WARNING |
| `READY` | всё обязательное прошло, WARNING и выше нет |

Отчёт — по `report-template.md`. Сохрани два файла в
`<git rev-parse --git-common-dir>/pre-pr/<полный sha HEAD>/`:

- `report.md` — отчёт целиком;
- `status.json` — `{ "status": "<СТАТУС>", "sha": "<sha>", "base": "<base>" }`.

Их читает хук `.claude/hooks/pre-pr-gate.mjs` перед `gh pr create`. Затем
покажи отчёт пользователю целиком.
