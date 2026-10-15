/* ==========================================================================
   PromoRadar — точка входа.
   Инициализация, связка модулей, глобальные обработчики.
   ========================================================================== */

const App = {
  /* ---------------------------------------------------------------------
     ЗАПУСК
     --------------------------------------------------------------------- */
  async init() {
    console.log(`[App] ${CONFIG.APP_NAME} v${CONFIG.VERSION} — старт`);

    // 1. Восстанавливаем состояние из localStorage
    Storage.loadViewed();
    Storage.loadFilter();

    // 2. Загружаем данные (coupons.json → фолбэк на mock)
    await Data.load();

    // 3. Рендерим UI
    Filters.render();
    Filters.apply();

    // 4. Вешаем события
    Filters.bind();
    UI.bind();
    if (window.VK) VK.bind();
    if (window.TG) TG.bind();
    this.bindGlobal();

    // 5. Первый рендер карточек
    UI.render();

    // 6. Год в футере
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    console.log(`[App] готово. Купонов: ${STATE.coupons.length}, отфильтровано: ${STATE.filtered.length}`);
  },

  /* ---------------------------------------------------------------------
     ГЛОБАЛЬНЫЕ СОБЫТИЯ (ссылки соцсетей, кнопка "обновить", хоткеи)
     --------------------------------------------------------------------- */
  bindGlobal() {
    // Ссылки на Telegram и VK
    const links = {
      tgLink: CONFIG.TELEGRAM_URL,
      tgFooter: CONFIG.TELEGRAM_URL,
      vkFooter: CONFIG.VK_URL
    };
    Object.entries(links).forEach(([id, url]) => {
      const el = document.getElementById(id);
      if (el) {
        el.href = url;
        if (url && url !== 'https://t.me/' && url !== 'https://vk.com/') {
          el.target = '_blank';
          el.rel = 'noopener';
        }
      }
    });

    // Кнопка "Обновить" — перезагрузка данных без перезагрузки страницы
    const refresh = document.getElementById('refreshBtn');
    if (refresh && !refresh.dataset.appBound) {
      refresh.dataset.appBound = '1';
      refresh.addEventListener('click', () => App.refresh());
    }

    // Ctrl+K / Cmd+K — фокус на поиске
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('searchInput')?.focus();
      }
    });

    // Клик по логотипу — сброс фильтров
    const logo = document.querySelector('.logo');
    if (logo && !logo.dataset.appBound) {
      logo.dataset.appBound = '1';
      logo.addEventListener('click', e => {
        e.preventDefault();
        App.resetFilters();
      });
    }
  },

  /* ---------------------------------------------------------------------
     ОБНОВИТЬ ДАННЫЕ
     --------------------------------------------------------------------- */
  async refresh() {
    const btn = document.getElementById('refreshBtn');
    const old = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '…'; }

    try {
      await Data.load();
      Filters.apply();
      UI.render();
      UI.showToast('Данные обновлены');
    } catch (e) {
      console.error('[App] refresh error:', e);
      UI.showToast('Не удалось обновить', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = old; }
    }
  },

  /* ---------------------------------------------------------------------
     СБРОС ФИЛЬТРОВ (клик по логотипу)
     --------------------------------------------------------------------- */
  resetFilters() {
    STATE.category = 'all';
    STATE.query = '';
    STATE.sortBy = 'popular';
    Storage.saveFilter();

    const input = document.getElementById('searchInput');
    const clear = document.getElementById('searchClear');
    if (input) input.value = '';
    if (clear) clear.hidden = true;

    Filters.render();
    Filters.refresh();
  }
};

window.App = App;

/* --------------------------------------------------------------------------
   СТАРТ
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});