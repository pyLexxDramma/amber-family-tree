# Контракт API (AngeloApi)

Фронт обращается к данным только через объект `api`, реализующий интерфейс `AngeloApi`. Типы описаны в `src/types/index.ts` и `src/integrations/api.types.ts`.

## feed

| Метод | Описание | Параметры | Ответ |
|-------|----------|-----------|--------|
| `list(params?)` | Список публикаций ленты | `FeedListParams`: `limit?`, `offset?`, `authorId?`, `topicTag?` | `Publication[]` |
| `getById(id)` | Публикация по id | `id: string` | `Publication \| null` |

## family

| Метод | Описание | Параметры | Ответ |
|-------|----------|-----------|--------|
| `listMembers()` | Все члены семьи | — | `FamilyMember[]` |
| `getMember(id)` | Член семьи по id | `id: string` | `FamilyMember \| null` |

## auth

| Метод | Описание | Параметры | Ответ |
|-------|----------|-----------|--------|
| `login(identifier)` | Вход по телефону/email | `identifier: string` | `AppUser` |
| `register(identifier)` | Регистрация | `identifier: string` | `AppUser` |
| `me()` | Текущий пользователь | — | `AppUser \| null` |

## profile

| Метод | Описание | Параметры | Ответ |
|-------|----------|-----------|--------|
| `getMyProfile()` | Профиль текущего пользователя | — | `FamilyMember` |
| `updateMyProfile(patch)` | Обновить свой профиль | `Partial<FamilyMember>` | `FamilyMember` |
| `listMyMedia()` | Мои медиафайлы | — | `MediaItem[]` |

## Типы (кратко)

- **FamilyMember**: id, firstName, lastName, middleName?, nickname?, birthDate, deathDate?, city?, about?, avatar?, role, isActive, generation, relations[]
- **Publication**: id, type, authorId, coAuthorIds[], title?, text, eventDate, publishDate, media[], participantIds[], topicTag, likes[], comments[], isRead, visibleFor?, excludeFor?
- **MediaItem**: id, type, url, name, size, eventDate?, year?, category?, publicationId?
- **Comment**: id, authorId, text, createdAt
- **AppUser**: id, member (FamilyMember), subscription (planId, usedPlaces, expiresAt)

Полные определения — в `src/types/index.ts`.
