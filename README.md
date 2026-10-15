# PromoRadar

Агрегатор промокодов и скидок: доставка еды, кино, банки, маркетплейсы.
Сайт на GitHub Pages + Telegram-канал + группа ВК с автопостингом.

## Структура

```
promo-radar/
├── index.html              # разметка
├── styles.css              # тёмная тема, жёлтый акцент
├── data/
│   └── coupons.json        # данные (обновляет парсер)
├── js/
│   ├── config.js           # настройки, категории, storage
│   ├── data.js             # загрузка + mock-данные
│   ├── filters.js          # фильтры и поиск
│   ├── ui.js               # карточки, модалка, тосты
│   ├── vk.js               # VK: формат поста + шаринг
│   ├── tg.js               # TG: формат поста + шаринг
│   └── app.js              # точка входа
├── parser/
│   ├── parser.py           # Python-парсер (stdlib only)
│   └── README.md
└── .github/workflows/
    └── parser.yml          # cron раз в сутки
```

## Локальный запуск

1. Скачай репозиторий.
2. Открой `index.html` в браузере — сайт работает на mock-данных.
3. Чтобы обновить данные через парсер:
   ```bash
   python parser/parser.py --dry-run   # посмотреть
   python parser/parser.py             # записать
   ```

## Деплой на GitHub Pages

1. Запушь репозиторий на GitHub:
   ```bash
   cd promo-radar
   git init
   git add .
   git commit -m "PromoRadar: initial"
   git branch -M main
   git remote add origin https://github.com/<username>/promo-radar.git
   git push -u origin main
   ```
2. На GitHub: Settings → Pages → Source: `main` / `/ (root)`.
3. Через минуту сайт откроется: `https://<username>.github.io/promo-radar/`.

## Автопостинг

1. Создай VK Standalone App → получи access_token с правами `wall, groups, offline`.
2. Создай Telegram-бота у @BotFather → получи токен.
3. Добавь бота админом в канал → узнай `chat_id` (например, `@my_channel`).
4. В репозитории: Settings → Secrets and variables → Actions → New secret:
   - `VK_ACCESS_TOKEN`
   - `VK_GROUP_ID`
   - `TG_BOT_TOKEN`
   - `TG_CHAT_ID`
5. GitHub Actions будет запускать `parser.py` раз в сутки и постить новые купоны.

## Лицензия

MIT (или твоя).