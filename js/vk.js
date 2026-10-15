/* ==========================================================================
   PromoRadar — VK
   1) Генератор текста поста (переиспользуется Python-парсером)
   2) Кнопка "Поделиться ВКонтакте" в модалке
   3) publish() — для локальных тестов через API (в проде НЕ использовать)
   ========================================================================== */

const VK = {
  /* ---------------------------------------------------------------------
     ГЕНЕРАТОР ТЕКСТА ПОСТА
     Тот же формат используется в parser/parser.py:format_post_vk — держи синхронно!
     --------------------------------------------------------------------- */
  formatPost(c) {
    if (!c) return '';

    const cat = CATEGORIES.find(x => x.id === c.category);
    const catTitle = cat ? cat.title : c.category;
    const siteUrl = location.origin && location.origin !== 'null'
      ? location.origin
      : 'https://promo-radar.example';

    const lines = [];
    lines.push(`🔥 ${c.shop} — ${c.discount || 'скидка'}`);
    lines.push('');
    lines.push(c.title || '');

    if (c.description) {
      lines.push('');
      lines.push(c.description);
    }

    if (c.code && c.code !== '—') {
      lines.push('');
      lines.push(`🎟 Промокод: ${c.code}`);
    }

    if (c.conditions) {
      lines.push('');
      lines.push(`⚡ ${c.conditions}`);
    }

    lines.push('');
    lines.push(`⏰ ${Utils.expiresText(c.expires)}`);
    lines.push('');
    lines.push(`👉 ${c.url || siteUrl}`);
    lines.push('');
    lines.push('#промокоды #скидки #' + catTitle.toLowerCase().replace(/\s/g, ''));

    return lines.join('\n');
  },

  /* ---------------------------------------------------------------------
     КНОПКА "ПОДЕЛИТЬСЯ" — открывает VK Share
     --------------------------------------------------------------------- */
  share(c) {
    if (!c) return;

    const shortText = `${c.shop}: ${c.title}${c.code && c.code !== '—' ? ' — промокод ' + c.code : ''}`;

    const params = new URLSearchParams({
      url: c.url || location.href,
      title: shortText,
      description: 'Промокоды и скидки на PromoRadar',
      noparse: 'true'
    });

    const shareUrl = `https://vk.com/share.php?${params.toString()}`;

    const w = 640, h = 480;
    const left = (screen.width - w) / 2;
    const top = (screen.height - h) / 2;
    window.open(shareUrl, 'vk_share', `width=${w},height=${h},left=${left},top=${top}`);
  },

  /* ---------------------------------------------------------------------
     ПУБЛИКАЦИЯ ЧЕРЕЗ API (только для локальных тестов!)
     ⚠️ Требует access_token в CONFIG.VK.ACCESS_TOKEN и GROUP_ID.
     ⚠️ В продакшне постим из Python — токен в GitHub Secrets.
     --------------------------------------------------------------------- */
  async publish(c) {
    const { ACCESS_TOKEN, GROUP_ID } = CONFIG.VK;

    if (!ACCESS_TOKEN || !GROUP_ID) {
      console.warn('[VK] publish(): не заданы ACCESS_TOKEN или GROUP_ID в CONFIG.VK');
      return { ok: false, error: 'no_token' };
    }

    const message = VK.formatPost(c);
    const ownerId = `-${GROUP_ID}`;

    const body = new URLSearchParams({
      owner_id: ownerId,
      from_group: '1',
      message,
      v: '5.199',
      access_token: ACCESS_TOKEN
    });

    if (c.url) {
      body.append('attachments', c.url);
    }

    try {
      const res = await fetch('https://api.vk.com/method/wall.post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      const json = await res.json();
      if (json.error) {
        console.error('[VK] API error:', json.error);
        return { ok: false, error: json.error };
      }
      console.log('[VK] опубликовано, post_id:', json.response?.post_id);
      return { ok: true, data: json.response };
    } catch (e) {
      console.error('[VK] network error:', e);
      return { ok: false, error: e.message };
    }
  },

  /* ---------------------------------------------------------------------
     ПРИВЯЗКА КНОПКИ В МОДАЛКЕ
     --------------------------------------------------------------------- */
  bind() {
    const btn = document.getElementById('shareVk');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', () => {
      const c = UI.getCurrentCoupon && UI.getCurrentCoupon();
      if (!c) {
        UI.showToast('Нечего делиться', 'error');
        return;
      }
      VK.share(c);
    });
  }
};

window.VK = VK;