# Доска задач (для ИИ)

**Схема карточки:** `{ id?, column, title, tag, desc?, pay?, due?, progress? }`  
**Колонки:** `backlog` | `todo` | `progress` | `review` | `done`  
**Теги:** `backend` | `frontend` | `devops` | `bug` | `other`

---

## Операции

### 1. Разложи по колонкам

Назначить карточкам колонки по правилам (например: по тегу, по приоритету или из списка).

- **Скрипт:** `node scripts/board.mjs columns [правило]`
- Правила (опционально): по умолчанию колонка уже задана в `cards.json`; можно передать JSON с маппингом `id → column` для перераспределения.

Пример перераспределения по файлу:
```bash
node scripts/board.mjs columns --file columns.json
```
где `columns.json`: `{ "auth": "progress", "filters": "todo" }`

### 2. Поставь дедлайны / прогресс

Проставить полям `due` и/или `progress` (0–100).

- **Скрипт:** `node scripts/board.mjs deadlines [--due=YYYY-MM-DD] [--progress=N] [--column=todo]`
- По умолчанию: дедлайн `2026-02-26`, прогресс не меняется; можно ограничить по колонке.

Примеры:
```bash
node scripts/board.mjs deadlines --due=2026-02-26 --column=todo
node scripts/board.mjs deadlines --progress=50 --column=progress
```

### 3. Обнови текущие карточки (merge)

Влить внешний список карточек в текущий: по `id` обновить поля, новые карточки добавить.

- **Скрипт:** `node scripts/board.mjs merge < path/to/incoming.json`
- Формат входа: массив карточек с полями схемы; у существующих по `id` перезаписываются только переданные поля.

Пример входящего фрагмента:
```json
[
  { "id": "auth", "column": "progress", "progress": 25 },
  { "id": "new-task", "column": "backlog", "title": "Новая задача", "tag": "frontend" }
]
```

---

## Файлы

| Файл | Назначение |
|------|------------|
| `docs/board/cards.json` | Текущее состояние доски (meta + cards). |
| `scripts/board.mjs` | Скрипт: columns, deadlines, merge. |

После запуска скриптов изменения записываются в `docs/board/cards.json`.
