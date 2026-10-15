/* ==========================================================================
   PromoRadar — Telegram
   1) Генератор текста поста (переиспользуется Python-парсером)
   2) Кнопка "Поделиться в Telegram" в модалке
   3) publish() — для локальных тестов через Bot API (в проде НЕ использовать)
   ========================================================================== */

const TG = {
  /* ---------------------------------------------------------------------
     ГЕНЕРАТОР ТЕКСТА ПОСТА
     Формат совпадает с parser/parser.py:format_post_tg — держи синхронно!
     Использует legacy Markdown (звёздочки — жирный, бэктики — моноширинный).
     --------------------------------------------------------------------- */
  formatPost(c) {
    if (!c) return '';

    const cat = CATEGORIES.find(x => x.id === c.category);
    const catTitle = cat ? cat.title : c.category;
    const siteUrl = location.origin && location.origin !== 'null'
      ? location.origin
      : 'https://promo-radar.example';

    const lines = [];
    lines.push(`🔥 *${c.shop}* — ${c.discount || 'скидка'}`);
    lines.push('');
    lines.push(c.title || '');

    if (c.description) {
      lines.push('');
      lines.push(c.description);
    }

    if (c.code && c.code !== '—') {
      lines.push('');
      lines.push(`🎟 Промокод: \`${c.code}\``);
    }

    if (c.conditions) {
      lines.push('');
      lines.push(`⚡ ${c.conditions}`);
    }

    lines.push('');
    lines.push(`⏰ ${Utils.expiresText(c.expires)}`);
    lines.push('');
    lines.push(`👉 [Перейти в магазин](${c.url || siteUrl})`);
    lines.push('');
    lines.push(`#промокоды #скидки #${catTitle.toLowerCase().replace(/\s/g, '')}`);

    return lines.join('\n');
  },

  /* ---------------------------------------------------------------------
     КНОПКА "ПОДЕЛИТЬСЯ" — открывает Telegram Share
     --------------------------------------------------------------------- */
  share(c) {
    if (!c) return;

    const siteUrl = location.origin && location.origin !== 'null'
      ? location.origin
      : 'https://promo-radar.example';

    const text = `🔥 ${c.shop}: ${c.title}${c.code && c.code !== '—' ? ' — промокод ' + c.code : ''}\n\n${c.url || siteUrl}`;

    const shareUrl = CONFIG.TG.SHARE_BOT
      ? `https://t.me/${CONFIG.TG.SHARE_BOT}?url=${encodeURIComponent(c.url || siteUrl)}&text=${encodeURIComponent(text)}`
      : `https://t.me/share/url?url=${encodeURIComponent(c.url || siteUrl)}&text=${encodeURIComponent(text)}`;

    window.open(shareUrl, 'tg_share', 'width=640,height=560');
  },

  /* ---------------------------------------------------------------------
     ПУБЛИКАЦИЯ ЧЕРЕЗ BOT API (только для локальных тестов!)
     ⚠️ Требует BOT_TOKEN и CHAT_ID в CONFIG.TG.
     ⚠️ В продакшне постим из Python — токен в GitHub Secrets.
     --------------------------------------------------------------------- */
  async publish(c, options = {}) {
    const { BOT_TOKEN, CHAT_ID } = CONFIG.TG;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn('[TG] publish(): не заданы BOT_TOKEN или CHAT_ID в CONFIG.TG');
      return { ok: false, error: 'no_token' };
    }

    const text = TG.formatPost(c);
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const body = {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    };

    if (options.withButton && c.url) {
      body.reply_markup = {
        inline_keyboard: [[
          { text: '🛍 Перейти в магазин', url: c.url }
        ]]
      };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!json.ok) {
        console.error('[TG] API error:', json.description);
        return { ok: false, error: json.description };
      }
      console.log('[TG] опубликовано, message_id:', json.result?.message_id);
      return { ok: true, data: json.result };
    } catch (e) {
      console.error('[TG] network error:', e);
      return { ok: false, error: e.message };
    }
  },

  /* ---------------------------------------------------------------------
     ПРИВЯЗКА КНОПКИ В МОДАЛКЕ
     --------------------------------------------------------------------- */
  bind() {
    const btn = document.getElementById('shareTg');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.hidden = false;

    btn.addEventListener('click', () => {
      const c = UI.getCurrentCoupon && UI.getCurrentCoupon();
      if (!c) {
        UI.showToast('Нечего делиться', 'error');
        return;
      }
      TG.share(c);
    });
  }
};

window.TG = TG;