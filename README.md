# Melora / Sptfy full-stack project

این نسخه، فرانت‌اند Next.js فایل اولیه را به یک بک‌اند Django REST Framework متصل می‌کند. بک‌اند شامل احراز هویت، نقش‌ها، اشتراک‌های پویا، آهنگ و آلبوم، پلی‌لیست، اعلان، تیکت پشتیبانی، تأیید هنرمند، گزارش‌های تجمیعی، حسابرسی هنرمندان، آپلود رسانه و پرداخت آزمایشی است.


## بخش‌های تکمیل‌شده در این نسخه

این نسخه هشت بخش اصلی خواسته‌شده را به API جنگو متصل کرده است: ورود/ثبت‌نام، Home، User Profile، Artist Profile، Notifications، Playlists، Albums & Singles و Music Player. داده‌های این صفحات در حالت اجرای بک‌اند از API خوانده/نوشته می‌شوند و محدودیت‌های اشتراک مرتبط نیز در بک‌اند اعمال می‌شوند.

## اجرای سریع با Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Django admin: `http://localhost:8000/admin`

## اجرای بدون Docker

دستورهای کامل، حساب‌های نمونه و فهرست endpointها در [`backend/README.md`](backend/README.md) نوشته شده است.

## تست‌ها

```bash
cd backend
python manage.py test
```

```bash
npm install
npm test
```
