// ==========================================
// فایل اصلی ربات فیلم و سریال (سینما)
// Cloudflare Worker
// ==========================================

// لیست کامل فیلم‌ها و سریال‌ها (این بخش رو با لیست ۱۰۰تایی پر کن)
const DATA = {
  "فیلم": {
    "معمایی": [
      { title: "The Godfather", rating: "9.2/10" },
      { title: "The Dark Knight", rating: "9.0/10" },
      { title: "Pulp Fiction", rating: "8.9/10" }
    ],
    "عاشقانه": [
      { title: "Titanic", rating: "7.9/10" },
      { title: "La La Land", rating: "8.0/10" },
      { title: "The Notebook", rating: "7.8/10" }
    ],
    "اکشن": [
      { title: "Die Hard", rating: "8.2/10" },
      { title: "Mad Max: Fury Road", rating: "8.1/10" },
      { title: "Gladiator", rating: "8.5/10" }
    ]
  },
  "سریال": {
    "معمایی": [
      { title: "Breaking Bad", rating: "9.5/10" },
      { title: "True Detective", rating: "8.9/10" },
      { title: "Sherlock", rating: "9.1/10" }
    ],
    "عاشقانه": [
      { title: "The Crown", rating: "8.6/10" },
      { title: "Normal People", rating: "8.4/10" },
      { title: "Bridgerton", rating: "7.4/10" }
    ],
    "اکشن": [
      { title: "Game of Thrones", rating: "9.2/10" },
      { title: "The Boys", rating: "8.7/10" },
      { title: "Daredevil", rating: "8.6/10" }
    ]
  }
};

// پیام‌های آماده (دقیقاً همون متن‌هایی که تایید کردی)
const MESSAGES = {
  start: `🎬 **به دنیای سینما خوش اومدی!**  
من دستیار هوشمند تو برای کشف بهترین فیلم‌ها و سریال‌های تاریخ سینمای جهان هستم.  
کافیه یه ژانر رو انتخاب کنی تا لیستی از **۱۰۰ عنوان برتر** که توسط منتقدان حرفه‌ای و کاربران IMDb تأیید شدن، با امتیاز دقیق برات به نمایش بذارم.  
  
🍿 بیا شروع کنیم، یه انتخاب کن!`,
  
  help: `🧭 **راهنمای استفاده از ربات**  
  
برای شروع، از منوی زیر یکی از دسته‌های «فیلم» یا «سریال» رو انتخاب کن.  
با لمس هر ژانر، لیستی از شاهکارهای ماندگار اون سبک رو دریافت می‌کنی.  
  
✨ **نکته:** امتیاز هر عنوان با فرمت \`7.6/10⭐️\` نمایش داده می‌شه تا بتونی سریع‌تر بهترین گزینه رو پیدا کنی.  
  
حالا بریم سراغ یه فیلم خوب؟ 🚀`,
  
  about: `🛠️ **درباره سازنده**  
  
این ربات با **عشق به سینما** و دقت به جزئیات، توسط یک توسعه‌دهنده خلاق طراحی و توسعه داده شده.  
هدف از ساخت این پروژه، ارائه تجربه‌ای سریع، دقیق و لذت‌بخش برای علاقه‌مندان به دنیای فیلم و سریاله.  
  
**⚡️ با افتخار ساخته شده با:**  
Cloudflare Workers & JavaScript  
  
منتظر پیشنهادها و ایده‌های جدیدت هستم! 💡`
};

// رنگ‌بندی دکمه‌ها
const BUTTON_COLORS = { green: "green", red: "red", blue: "blue" };

// تابع ارسال پیام
async function sendMessage(chatId, text, keyboard = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
    reply_markup: keyboard ? JSON.stringify(keyboard) : undefined
  };
  
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// منوی اصلی
function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🎬 فیلم", callback_data: "menu_film", color: BUTTON_COLORS.green },
        { text: "📺 سریال", callback_data: "menu_series", color: BUTTON_COLORS.blue }
      ],
      [
        { text: "👨‍💻 سازنده", callback_data: "menu_about", color: BUTTON_COLORS.red },
        { text: "🧭 راهنما", callback_data: "menu_help", color: BUTTON_COLORS.green }
      ]
    ]
  };
}

// کیبورد ژانرها
function genreKeyboard(type) {
  const genres = Object.keys(DATA[type]);
  const colors = [BUTTON_COLORS.green, BUTTON_COLORS.red, BUTTON_COLORS.blue];
  
  const rows = [];
  for (let i = 0; i < genres.length; i += 2) {
    const row = [];
    row.push({ text: genres[i], callback_data: `genre_${type}_${genres[i]}`, color: colors[i % 3] });
    if (genres[i+1]) {
      row.push({ text: genres[i+1], callback_data: `genre_${type}_${genres[i+1]}`, color: colors[(i+1) % 3] });
    }
    rows.push(row);
  }
  
  return { inline_keyboard: rows };
}

// تابع فرمت کردن لیست فیلم‌ها
function formatFilms(films) {
  return films.map((film, index) => {
    return `${index + 1}. \`${film.title}\`\n⭐️ **${film.rating}**`;
  }).join('\n\n');
}

// ورودی اصلی Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    const BOT_TOKEN = env.BOT_TOKEN; // توکن از محیط (Environment) خونده میشه
    const url = new URL(request.url);
    
    // تنظیم Webhook
    if (url.pathname === `/setWebhook`) {
      return new Response(await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${url.origin}${SECRET_PATH}`).then(r => r.text()));
    }
    
    // دریافت آپدیت‌ها
    if (url.pathname === SECRET_PATH && request.method === 'POST') {
      const update = await request.json();
      
      // Start
      if (update.message && update.message.text === '/start') {
        await sendMessage(update.message.chat.id, MESSAGES.start, mainMenuKeyboard());
      }
      
      // Callback
      if (update.callback_query) {
        const chatId = update.callback_query.message.chat.id;
        const data = update.callback_query.data;
        
        if (data === 'menu_film') {
          await sendMessage(chatId, "🎬 **انتخاب ژانر فیلم**", genreKeyboard('فیلم'));
        } else if (data === 'menu_series') {
          await sendMessage(chatId, "📺 **انتخاب ژانر سریال**", genreKeyboard('سریال'));
        } else if (data === 'menu_help') {
          await sendMessage(chatId, MESSAGES.help, mainMenuKeyboard());
        } else if (data === 'menu_about') {
          await sendMessage(chatId, MESSAGES.about, mainMenuKeyboard());
        }
        
        if (data.startsWith('genre_')) {
          const parts = data.split('_');
          const type = parts[1];
          const genre = parts[2];
          
          const films = DATA[type][genre] || ["فیلمی یافت نشد"];
          const listText = formatFilms(films);
          await sendMessage(chatId, `🎥 **لیست ۱۰۰ فیلم برتر ژانر ${genre}**\n\n${listText}`);
        }
      }
      
      return new Response('OK');
    }
    
    return new Response('Not found');
  }
};
