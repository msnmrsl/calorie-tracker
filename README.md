# Calorie Tracker — Telegram Mini App MVP

Bot + Mini App для быстрого учёта калорий.

## Стек

- **Web:** React + TypeScript + Vite + Telegram.WebApp
- **API:** Node.js + Express + TypeScript
- **DB:** SQLite (локально; схема совместима с PostgreSQL)
- **Auth:** валидация Telegram `initData` (в dev — `DEV_BYPASS_AUTH=1`)

## Деплой (кратко)

Приложение состоит из **двух частей**:

1. **Frontend (Mini App)** → [Vercel](https://vercel.com) — публичная HTTPS-ссылка  
2. **Backend (API + bot)** → [Render](https://render.com) (или Railway) — Express не работает на Vercel «как есть» вместе с SQLite

Подробная пошаговая инструкция для новичка — в чате / README ниже не дублирует весь UI Vercel.

### Frontend на Vercel

1. Залейте репозиторий на GitHub  
2. Import Project в Vercel  
3. Environment Variable: `VITE_API_URL=https://ВАШ-API.onrender.com`  
4. Deploy → получите `https://....vercel.app`

### Backend на Render

1. New → Web Service из того же GitHub-репо  
2. Build: `npm install && npm run build -w @calorie/shared`  
3. Start: `npm run start -w @calorie/api`  
4. Env: `DEV_BYPASS_AUTH=1`, `CORS_ORIGINS=https://ВАШ.vercel.app`, `WEBAPP_URL=https://ВАШ.vercel.app`

После деплоя обновите `VITE_API_URL` на Vercel и сделайте Redeploy.

## Быстрый старт

```bash
cp .env.example .env
npm install
npm run build -w @calorie/shared
npm run dev:api   # http://localhost:3001
npm run dev:web   # http://localhost:5173
```

Откройте в браузере: **http://localhost:5173**

В режиме `DEV_BYPASS_AUTH=1` Mini App работает без Telegram (удобно для локальной проверки).

## Telegram bot

1. Создайте бота в [@BotFather](https://t.me/BotFather)
2. Укажите `BOT_TOKEN` в `.env`
3. Для production задайте HTTPS `WEBAPP_URL` и подключите Web App кнопку
4. Перезапустите API — бот ответит на `/start` и шлёт ежедневные напоминания

## Экраны

1. Onboarding — цель и дневной лимит  
2. Search — поиск, избранное, недавние  
3. Product Card — БЖУ live, добавить в дневник  
4. Day Diary — съедено / осталось / повтор последнего  
5. History — калории по дням  

## API

| Method | Path | Описание |
|--------|------|----------|
| GET/PATCH | `/api/me` | профиль |
| GET | `/api/products?q=` | поиск |
| GET | `/api/products/:id` | карточка |
| GET/POST/DELETE | `/api/favorites` | избранное |
| GET/POST/DELETE | `/api/diary` | дневник |
| POST | `/api/diary/repeat-last` | повтор |
| GET | `/api/history` | история |
