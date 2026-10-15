/* ==========================================================================
   PromoRadar — UI: карточки, модалка, тосты, статистика
   Единственный модуль, который трогает DOM карточек и модалки.
   ========================================================================== */

const UI = {
  /* Текущий открытый купон — для кнопок "Поделиться" */
  _currentCoupon: null,

  getCurrentCoupon() {
    return UI._currentCoupon;
  },

  /* ---------------------------------------------------------------------
     ГЛАВНЫЙ РЕНДЕР
     --------------------------------------------------------------------- */
  render() {
    this.renderCards();
    this.updateCount();
    this.updateEmpty();
    this.updateStats();
  },

  /* ---------------------------------------------------------------------
     КАРТОЧКИ
     --------------------------------------------------------------------- */
  renderCards() {
    const grid = document.getElementById('couponsGrid');
    if (!grid) return;

    if (!STATE.filtered.length) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = STATE.filtered.map(c => this.card(c)).join('');
  },

  card(c) {
    const days = Utils.daysLeft(c.expires);
    const soon = (days !== null && days >= 0 && days <= 3) ? ' is-soon' : '';
    const cat = CATEGORIES.find(x => x.id === c.category);
    const catTitle = cat ? cat.title : c.category;
    const viewed = Storage.isViewed(c.id);
    const viewedClass = viewed ? ' card--viewed' : '';

    const logoHtml = c.logo
      ? `<img src="${Utils.escape(c.logo)}" alt="${Utils.escape(c.shop)}" loading="lazy">`
      : Utils.escape(Utils.initial(c.shop));

    const hasCode = c.code && c.code !== '—';
    const btnText = viewed ? 'Показать снова' : 'Показать код';

    return `
      <article class="card${viewedClass}" data-id="${Utils.escape(c.id)}">
        <div class="card__head">
          <div class="card__logo">${logoHtml}</div>
          <div>
            <div class="card__shop">${Utils.escape(c.shop)}</div>
            <div class="card__category">${Utils.escape(catTitle)}</div>
          </div>
        </div>

        <div class="card__discount">${Utils.escape(c.discount || '')}</div>
        <div class="card__title">${Utils.escape(c.title || '')}</div>
        ${c.conditions ? `<div class="card__conditions">${Utils.escape(c.conditions)}</div>` : ''}

        <div class="card__footer">
          <span class="card__expires${soon}">${Utils.expiresText(c.expires)}</span>
          <button class="btn btn--primary" data-open="${Utils.escape(c.id)}" type="button">
            ${hasCode ? btnText : 'Перейти'}
          </button>
        </div>
      </article>
    `;
  },

  /* ---------------------------------------------------------------------
     СЧЁТЧИК / ПУСТО / СТАТИСТИКА
     --------------------------------------------------------------------- */
  updateCount() {
    const el = document.getElementById('resultsCount');
    if (!el) return;
    const n = STATE.filtered.length;
    el.textContent = n
      ? `Найдено: ${n} ${this.plural(n, ['купон', 'купона', 'купонов'])}`
      : 'Ничего не найдено';
  },

  updateEmpty() {
    const empty = document.getElementById('emptyState');
    if (!empty) return;
    empty.hidden = STATE.filtered.length > 0;
  },

  updateStats() {
    const s = Data.stats();
    const st = document.getElementById('statTotal');
    const ss = document.getElementById('statShops');
    const su = document.getElementById('statUpdated');

    if (st) st.textContent = s.total;
    if (ss) ss.textContent = s.shops;
    if (su) {
      su.textContent = s.updated
        ? new Date(s.updated).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
        : '—';
    }
  },

  /* ---------------------------------------------------------------------
     МОДАЛКА
     --------------------------------------------------------------------- */
  openModal(id) {
    const c = Data.byId(id);
    if (!c) return;

    const modal = document.getElementById('modal');
    if (!modal) return;

    UI._currentCoupon = c;

    document.getElementById('modalBrand').textContent = c.shop || '';
    document.getElementById('modalTitle').textContent = c.title || '';
    document.getElementById('modalDesc').textContent = c.description || '';

    const codeEl = document.getElementById('modalCode');
    const codeWrap = document.getElementById('modalCodeWrap');
    const copyBtn = document.getElementById('copyCodeBtn');
    const goBtn = document.getElementById('modalGo');

    const hasCode = c.code && c.code !== '—';
    if (hasCode) {
      codeEl.textContent = c.code;
      codeWrap.hidden = false;
      if (copyBtn) copyBtn.hidden = false;
    } else {
      codeEl.textContent = '—';
      codeWrap.hidden = true;
      if (copyBtn) copyBtn.hidden = true;
    }

    if (goBtn) goBtn.href = c.url || '#';

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    Storage.markViewed(c.id);

    if (hasCode && copyBtn) {
      setTimeout(() => copyBtn.focus(), 50);
    }
  },

  closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    UI._currentCoupon = null;
    UI.renderCards();
  },

  /* ---------------------------------------------------------------------
     ТОСТ
     --------------------------------------------------------------------- */
  showToast(text, type = 'ok') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = text;
    t.classList.toggle('toast--error', type === 'error');
    t.hidden = false;
    clearTimeout(UI._toastTimer);
    UI._toastTimer = setTimeout(() => { t.hidden = true; }, 2000);
  },

  /* ---------------------------------------------------------------------
     КОПИРОВАНИЕ
     --------------------------------------------------------------------- */
  async copyCode() {
    const code = document.getElementById('modalCode')?.textContent || '';
    if (!code || code === '—') {
      UI.showToast('У этого предложения нет промокода', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      UI.showToast('Код скопирован: ' + code);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        UI.showToast('Код скопирован: ' + code);
      } catch (err) {
        UI.showToast('Не удалось скопировать', 'error');
      }
      document.body.removeChild(ta);
    }
  },

  /* ---------------------------------------------------------------------
     СОБЫТИЯ
     --------------------------------------------------------------------- */
  bind() {
    const grid = document.getElementById('couponsGrid');
    if (grid && !grid.dataset.bound) {
      grid.dataset.bound = '1';
      grid.addEventListener('click', e => {
        const btn = e.target.closest('[data-open]');
        if (!btn) return;
        UI.openModal(btn.dataset.open);
      });
    }

    const modal = document.getElementById('modal');
    if (modal && !modal.dataset.bound) {
      modal.dataset.bound = '1';
      modal.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) {
          UI.closeModal();
        }
      });
    }

    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn && !copyBtn.dataset.bound) {
      copyBtn.dataset.bound = '1';
      copyBtn.addEventListener('click', () => UI.copyCode());
    }

    if (!UI._escBound) {
      UI._escBound = true;
      document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        const m = document.getElementById('modal');
        if (m && !m.hidden) UI.closeModal();
      });
    }
  },

  /* ---------------------------------------------------------------------
     СКЛОНЕНИЕ
     --------------------------------------------------------------------- */
  plural(n, forms) {
    const a = Math.abs(n) % 100;
    const b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  }
};

window.UI = UI;