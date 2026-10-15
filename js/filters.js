/* ==========================================================================
   PromoRadar — фильтры, поиск, сортировка
   DOM не трогает. После каждой смены зовёт UI.render().
   ========================================================================== */

const Filters = {
  /* --- Рендер кнопок категорий --- */
  render() {
    const wrap = document.getElementById('filters');
    if (!wrap) return;

    wrap.innerHTML = CATEGORIES.map(cat => {
      const active = cat.id === STATE.category ? ' is-active' : '';
      return `<button class="filter${active}" data-category="${cat.id}" type="button">
                <span aria-hidden="true">${cat.icon}</span> ${Utils.escape(cat.title)}
              </button>`;
    }).join('');
  },

  /* --- Сеттеры --- */
  setCategory(id) {
    if (!CATEGORIES.some(c => c.id === id)) return;
    STATE.category = id;
    Storage.saveFilter();
    this.render();
    this.refresh();
  },

  setQuery(q) {
    STATE.query = String(q || '').trim();
    this.refresh();
  },

  setSort(sortBy) {
    STATE.sortBy = sortBy || 'popular';
    this.refresh();
  },

  /* --- Основная фильтрация (без DOM) --- */
  apply() {
    let list = STATE.coupons.slice();

    // Категория
    if (STATE.category !== 'all') {
      list = list.filter(c => c.category === STATE.category);
    }

    // Поиск
    if (STATE.query) {
      const q = STATE.query.toLowerCase();
      list = list.filter(c =>
        (c.shop || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }

    // Сортировка
    switch (STATE.sortBy) {
      case 'discount':
        list.sort((a, b) => (b.popular || 0) - (a.popular || 0));
        break;
      case 'date':
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        break;
      default:
        list.sort((a, b) => (b.popular || 0) - (a.popular || 0));
    }

    STATE.filtered = list;
    return list;
  },

  /* --- apply + render одной строкой --- */
  refresh() {
    this.apply();
    if (window.UI) UI.render();
  },

  /* --- Привязка событий --- */
  bind() {
    // Кнопки категорий (делегирование)
    const wrap = document.getElementById('filters');
    if (wrap && !wrap.dataset.bound) {
      wrap.dataset.bound = '1';
      wrap.addEventListener('click', e => {
        const btn = e.target.closest('[data-category]');
        if (!btn) return;
        Filters.setCategory(btn.dataset.category);
      });
    }

    // Поиск
    const input = document.getElementById('searchInput');
    const clear = document.getElementById('searchClear');
    if (input && !input.dataset.bound) {
      input.dataset.bound = '1';
      const onInput = Utils.debounce(() => {
        Filters.setQuery(input.value);
        if (clear) clear.hidden = !input.value;
      }, 200);
      input.addEventListener('input', onInput);
    }
    if (clear && input && !clear.dataset.bound) {
      clear.dataset.bound = '1';
      clear.addEventListener('click', () => {
        input.value = '';
        Filters.setQuery('');
        clear.hidden = true;
        input.focus();
      });
    }
  }
};

window.Filters = Filters;