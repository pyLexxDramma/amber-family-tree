# Деплой с Lovable

Проект развёрнут на **Lovable** и доступен по адресу:  
**https://amber-family-tree.lovable.app/**

Репозиторий на GitHub: **https://github.com/pyLexxDramma/amber-family-tree**

---

## 1. Связь Lovable ↔ GitHub

Двусторонняя синхронизация настроена так:

- **Lovable → GitHub:** правки в [Lovable](https://lovable.dev) автоматически коммитятся в этот репозиторий.
- **GitHub → Lovable:** пуши в ветку `main` подхватываются Lovable (редактор показывает актуальный код).

### Если проект ещё не привязан к GitHub

1. Откройте проект в [Lovable](https://lovable.dev).
2. Перейдите в **Settings → Connectors → GitHub**.
3. Подключите аккаунт GitHub (OAuth) и установите **Lovable GitHub App**.
4. Нажмите **Connect project** и выберите репозиторий `pyLexxDramma/amber-family-tree` (или создайте новый — тогда Lovable создаст репо и начнёт синхронизацию).

Подробнее: [Connect your project to GitHub](https://docs.lovable.dev/integrations/github).

---

## 2. Публикация и обновление (деплой)

Деплой делается **только из интерфейса Lovable**, не через GitHub Actions.

### Первая публикация

1. Откройте проект в [Lovable](https://lovable.dev).
2. В правом верхнем углу нажмите **Share** (или иконку публикации).
3. Выберите **Publish**.
4. При необходимости задайте поддомен (по умолчанию будет `*.lovable.app`).
5. Нажмите **Publish**. После сборки появится ссылка (например, `https://amber-family-tree.lovable.app/`).

### Обновление уже опубликованного приложения

Изменения **не публикуются автоматически**. После правок (в Lovable или через push в GitHub):

1. Откройте проект в Lovable.
2. **Share → Publish** (или иконка публикации).
3. Нажмите **Update**, чтобы задеплоить текущую версию.

Подробнее: [Publish your Lovable project](https://docs.lovable.dev/features/deploy).

---

## 3. Типичный сценарий: правки локально → деплой

1. Клонируйте репозиторий и работайте в IDE:
   ```bash
   git clone https://github.com/pyLexxDramma/amber-family-tree.git
   cd amber-family-tree
   npm i
   npm run dev
   ```
2. Закоммитьте и запушьте в `main`:
   ```bash
   git add .
   git commit -m "описание изменений"
   git push origin main
   ```
3. Дождитесь синхронизации Lovable с GitHub (обычно несколько секунд).
4. В Lovable: **Share → Publish → Update**, чтобы обновить живой сайт на https://amber-family-tree.lovable.app/.

---

## 4. Важно

- Не переименовывайте и не удаляйте репозиторий на GitHub — иначе связь с Lovable разорвётся.
- Lovable синхронизирует только ветку **main**.
- Кастомный домен (если нужен): **Project → Settings → Domains** в Lovable. Документация: [Custom domain](https://docs.lovable.dev/features/custom-domain).
