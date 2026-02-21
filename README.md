# Angelo — Amber Family Tree

**Angelo** — семейная сеть для хранения воспоминаний и общения с близкими. Дерево семьи, лента публикаций (фото, видео, аудио), профили родственников и голосовой помощник.

**Подробная инструкция по использованию:** [Инструкция пользователя →](docs/USAGE.md)

---

## Информация о проекте

- **Приложение:** https://amber-family-tree.lovable.app/
- **GitHub:** https://github.com/pyLexxDramma/amber-family-tree
- **Lovable:** откройте проект на [lovable.dev](https://lovable.dev) (URL вида `https://lovable.dev/projects/...`)

## Как редактировать код

**Через Lovable**

Зайдите в [проект Lovable](https://lovable.dev) и редактируйте через промпты. Изменения автоматически коммитятся в репозиторий.

**Локально в IDE**

Нужны Node.js и npm — [установка через nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
git clone <URL_РЕПОЗИТОРИЯ>
cd <ИМЯ_ПРОЕКТА>
npm i
npm run dev
```

Изменения, запушенные в GitHub, отобразятся в Lovable.

**Редактирование в GitHub**

Откройте нужный файл → «Edit» (иконка карандаша) → внесите изменения → Commit.

**GitHub Codespaces**

Repository → «Code» → вкладка Codespaces → «New codespace». Редактируйте в Codespace и пушьте изменения.

## Стек технологий

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Деплой

Деплой и обновления выполняются только из Lovable (не из GitHub):

1. Откройте проект в [Lovable](https://lovable.dev)
2. **Share** (справа сверху) → **Publish** (первый раз) или **Update** (обновление)
3. Приложение доступно по адресу https://amber-family-tree.lovable.app/

Подробнее: [DEPLOY.md](./DEPLOY.md)

## Подключение своего домена

Проект → Settings → Domains → Connect Domain. Подробности: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
