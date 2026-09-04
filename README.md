# 🎬 Telegram Movie Bot (Cloudflare Worker)

یک ربات تلگرامی برای معرفی بهترین فیلم‌ها و سریال‌ها بر اساس ژانر.

## ✨ امکانات
- دکمه‌های رنگی و شیشه‌ای (مطابق آپدیت جدید تلگرام)
- لیست ۱۰۰ فیلم برتر هر ژانر
- نمایش امتیاز IMDb
- اجرای سریع روی Cloudflare Workers

## 🛠️ تکنولوژی‌ها
- JavaScript
- Cloudflare Workers
- Telegram Bot API

## 🚀 نصب و راه‌اندازی
1. از BotFather یک ربات بسازید و توکن بگیرید.
2. فایل `wrangler.toml` را ویرایش کنید و توکن خود را در بخش `[vars]` قرار دهید.
3. با دستور زیر پروژه را روی کلادفلر آپلود کنید:
   ```bash
   wrangler deploy
