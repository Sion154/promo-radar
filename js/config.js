/* ==========================================================================
   PromoRadar — конфиг, категории, state, storage
   ========================================================================== */

const CONFIG = {
  APP_NAME: 'PromoRadar',
  VERSION: '0.3.0',

  DATA_URL: 'data/coupons.json',

  // Ссылки на соцсети
  TELEGRAM_URL: 'https://t.me/',
  VK_URL: 'https://vk.com/',

  // --- VK ---
  VK: {
    GROUP_URL: 'https://vk.com/',
    GROUP_ID: '',
    ACCESS_TOKEN: '' // ⚠️ только для локальных тестов, не коммитить с токеном
  },

  // --- Telegram ---
  TG: {
    CHANNEL_URL: 'https://t.me/',
    SHARE_BOT: '',
    BOT_TOKEN: '', // ⚠️ только для локальных тестов
    CHAT_ID: ''
  },

  STORAGE: {
    VIEWED: 'pr_viewed_coupons',
    FAVORITES: 'pr_favorites',
    FILTER: 'pr_last_filter'
  }
};

/* --------------------------------------------------------------------------
   КАТЕГОРИИ
   -------------------------------------------------------------------------- */
const CATEGORIES = [
  { id: 'all',         title: 'Все',          icon: '🔥' },
  { id: 'food',        title: 'Еда',          icon: '🍔' },
  { id: 'cinema',      title: 'Кино',         icon: '🎬' },
  { id: 'banks',       title: 'Банки',        icon: '💳' },
  { id: 'marketplace', title: 'Маркетплейсы', icon: '🛒' },
  { id: 'travel',      title: 'Путешествия',  icon: '✈️' },
  { id: 'games',       title: 'Игры',         icon: '🎮' },
  { id: 'subs',        title: 'Подписки',     icon: '📱' }
];

/* --------------------------------------------------------------------------
   СОСТОЯНИЕ
   -------------------------------------------------------------------------- */
const STATE = {
  coupons: [],
  filtered: [],
  category: 'all',
  query: '',
  sortBy: 'popular',
  viewedIds: new Set(),
  lastUpdate: null
};

/* --------------------------------------------------------------------------
   STORAGE
   -------------------------------------------------------------------------- */
const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('[Storage] get error:', e);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[Storage] set error:', e);
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); }
    catch (e) { console.warn('[Storage] remove error:', e); }
  },

  loadViewed() {
    const arr = Storage.get(CONFIG.STORAGE.VIEWED, []);
    STATE.viewedIds = new Set(Array.isArray(arr) ? arr : []);
    return STATE.viewedIds;
  },
  saveViewed() {
    Storage.set(CONFIG.STORAGE.VIEWED, Array.from(STATE.viewedIds));
  },
  markViewed(id) {
    if (!id) return;
    STATE.viewedIds.add(id);
    Storage.saveViewed();
  },
  isViewed(id) { return STATE.viewedIds.has(id); },

  loadFilter() {
    const cat = Storage.get(CONFIG.STORAGE.FILTER, 'all');
    STATE.category = CATEGORIES.some(c => c.id === cat) ? cat : 'all';
    return STATE.category;
  },
  saveFilter() {
    Storage.set(CONFIG.STORAGE.FILTER, STATE.category);
  }
};

/* --------------------------------------------------------------------------
   УТИЛИТЫ
   -------------------------------------------------------------------------- */
const Utils = {
  escape(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  daysLeft(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr + 'T23:59:59');
    const now = new Date();
    return Math.ceil((target - now) / 86400000);
  },
  expiresText(dateStr) {
    const d = Utils.daysLeft(dateStr);
    if (d === null) return 'Бессрочно';
    if (d < 0) return 'Истёк';
    if (d === 0) return 'Истекает сегодня';
    if (d === 1) return 'Остался 1 день';
    if (d < 5) return `Осталось ${d} дня`;
    return `До ${Utils.formatDate(dateStr)}`;
  },
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  },
  initial(str) { return (str || '?').trim().charAt(0).toUpperCase(); },
  debounce(fn, ms = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
};

window.CONFIG = CONFIG;
window.CATEGORIES = CATEGORIES;
window.STATE = STATE;
window.Storage = Storage;
window.Utils = Utils;