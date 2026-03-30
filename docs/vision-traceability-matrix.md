# Матрица соответствия: видение заказчика → эпики → код

Документ: `docs/Видение_ANGELO_2026_03_26_для_разработчиков.pdf`. Версия матрицы привязана к состоянию репозитория на момент создания.

| Пункт видения | Эпик (работа) | Код / модули | Статус |
|---------------|---------------|--------------|--------|
| Семья: дерево и список родственников | Единый раздел «Семья» с представлениями | [`src/pages/FamilyTree.tsx`](src/pages/FamilyTree.tsx), [`src/pages/FamilyList.tsx`](src/pages/FamilyList.tsx), [`ROUTES.classic.tree`](src/constants/routes.ts), `family` | Частично: два экрана и два таба в навбаре |
| История: таймлайн десятилетие / год / день | Таймлайн + фильтры по участникам событий | [`src/pages/TimelinePage.tsx`](src/pages/TimelinePage.tsx) (и year/decade), [`backend/app/api/feed.py`](backend/app/api/feed.py) | Частично: уровни времени есть; фильтры по участникам событий — после модели Event |
| Событие как сущность (название, дата, участники M2M, контент) | Домен Event + API + UI карточки | [`Publication`](backend/app/models/publication.py), лента | Разрыв: публикации с `event_date`, не Event M2M |
| Коллекции: типы → альбомы → контент, лента внутри | Иерархия коллекций и просмотр-лента | [`src/pages/Albums.tsx`](src/pages/Albums.tsx), [`src/pages/AlbumDetails.tsx`](src/pages/AlbumDetails.tsx), `my-media` | Частично: альбомы есть; укрупнённая модель «по типам» как в ТЗ — нет |
| Мессенджер: личные и групповые чаты, медиа, реакции, звонки | Транспорт сообщений, комнаты, WebRTC/интеграция | [`backend/app/models/message.py`](backend/app/models/message.py), [`backend/app/api/messages.py`](backend/app/api/messages.py), [`src/pages/Messages.tsx`](src/pages/Messages.tsx) | Минимум: текст 1:1 в семье; см. [`docs/messenger-spike.md`](messenger-spike.md) |
| Связность: событие из чата/коллекций, шаринг в чат | Кросс-модули, deep links | — | Не реализовано |
| Профиль: аккаунт, подписка, инвайты, уведомления, приватность, контент, микрофон | Настройки MVP | [`src/pages/Settings.tsx`](src/pages/Settings.tsx), [`src/pages/MyProfile.tsx`](src/pages/MyProfile.tsx) | См. [`docs/profile-mvp-checklist.md`](profile-mvp-checklist.md) |
| Ателье (магазин) | Коммерция, печать | [`src/constants/routes.ts`](src/constants/routes.ts) `store`, UI магазина | Заглушка |
| ИИ (пост-MVP) | Подсказки событий, воспоминания | [`src/ai/AiShell.tsx`](src/ai/AiShell.tsx) | Вне MVP по видению |
| Приватность «две семьи» / права на контент | RBAC по профилям и событиям | частично family/member | Требует продуктовой проработки |
| Объекты медиа, публичные URL S3 | Надёжные ссылки на файлы | [`backend/app/storage_urls.py`](backend/app/storage_urls.py), `media` `feed` `profile` API | `resolve_public_media_url` для аватаров и превью |
| Навигация по видению (опция) | Табы Семья / История / … | `VITE_VISION_IA_NAV`, [`BottomNav`](src/components/BottomNav.tsx), [`visionIa.ts`](src/lib/visionIa.ts), [`MessagesHub`](src/pages/MessagesHub.tsx) | Выкл. по умолчанию |

Обновлять таблицу при закрытии эпиков или смене IA.
