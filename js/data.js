/* ==========================================================================
   PromoRadar — mock-данные и загрузчик
   Позже coupons.json будет формировать Python-парсер.
   ========================================================================== */

const MOCK_COUPONS = [
  /* --- Еда --- */
  {
    id: 'kuper-500',
    shop: 'Купер',
    category: 'food',
    title: '500 ₽ на первый заказ от 1500 ₽',
    description: 'Скидка для новых пользователей сервиса доставки.',
    discount: '500 ₽',
    code: 'KUPER500',
    conditions: 'Только для новых клиентов. Минимальная сумма заказа — 1500 ₽.',
    url: 'https://kuper.ru/',
    expires: '2026-12-31',
    popular: 95,
    createdAt: '2026-10-01'
  },
  {
    id: 'samokat-300',
    shop: 'Самокат',
    category: 'food',
    title: '300 ₽ на первый заказ',
    description: 'Промокод на первую доставку продуктов.',
    discount: '300 ₽',
    code: 'SAMOKAT300',
    conditions: 'Для новых пользователей. Заказ от 800 ₽.',
    url: 'https://samokat.ru/',
    expires: '2026-11-30',
    popular: 88,
    createdAt: '2026-10-02'
  },
  {
    id: 'dodo-2x1',
    shop: 'Додо Пицца',
    category: 'food',
    title: 'Вторая пицца в подарок',
    description: 'При заказе двух пицц — вторая бесплатно.',
    discount: '2 по цене 1',
    code: 'DODO2X1',
    conditions: 'Акция действует в приложении и на сайте. Участвует ограниченный выбор пицц.',
    url: 'https://dodopizza.ru/',
    expires: '2026-11-15',
    popular: 92,
    createdAt: '2026-10-03'
  },
  {
    id: 'eda-400',
    shop: 'Яндекс Еда',
    category: 'food',
    title: '400 ₽ на заказ от 1000 ₽',
    description: 'Скидка для новых пользователей Яндекс Еды.',
    discount: '400 ₽',
    code: 'EDA400',
    conditions: 'Только для новых аккаунтов. Заказ от 1000 ₽.',
    url: 'https://eda.yandex.ru/',
    expires: '2026-12-15',
    popular: 90,
    createdAt: '2026-10-04'
  },
  {
    id: 'free-delivery',
    shop: 'Купер',
    category: 'food',
    title: 'Бесплатная доставка весь месяц',
    description: 'Промокод на бесплатную доставку при заказе от 500 ₽.',
    discount: '0 ₽ доставка',
    code: 'FREEDEL',
    conditions: 'Действует на заказы от 500 ₽. Один раз в день.',
    url: 'https://kuper.ru/',
    expires: '2026-11-01',
    popular: 70,
    createdAt: '2026-10-05'
  },

  /* --- Кино --- */
  {
    id: 'premier-30',
    shop: 'Premier',
    category: 'cinema',
    title: '30 дней подписки бесплатно',
    description: 'Пробный период на онлайн-кинотеатр Premier.',
    discount: '30 дней',
    code: 'PREMIER30',
    conditions: 'Только для новых подписчиков. Автопродление отключается в личном кабинете.',
    url: 'https://premier.one/',
    expires: '2026-12-31',
    popular: 85,
    createdAt: '2026-10-01'
  },
  {
    id: 'start-14',
    shop: 'START',
    category: 'cinema',
    title: '14 дней бесплатно',
    description: 'Пробный период на онлайн-кинотеатр START.',
    discount: '14 дней',
    code: 'START14',
    conditions: 'Новым пользователям. Карта не требуется.',
    url: 'https://start.ru/',
    expires: '2026-12-01',
    popular: 78,
    createdAt: '2026-10-02'
  },
  {
    id: 'amed-1',
    shop: 'Amediateka',
    category: 'cinema',
    title: '30 дней за 1 ₽',
    description: 'Первый месяц подписки почти бесплатно.',
    discount: '30 дней за 1 ₽',
    code: 'AMED1',
    conditions: 'Для новых подписчиков. Далее по стандартной цене.',
    url: 'https://www.amediateka.ru/',
    expires: '2026-11-20',
    popular: 82,
    createdAt: '2026-10-03'
  },
  {
    id: 'flex-7',
    shop: 'FLEX',
    category: 'cinema',
    title: '7 дней бесплатного доступа',
    description: 'Неделя подписки на FLEX бесплатно.',
    discount: '7 дней',
    code: 'FLEX7',
    conditions: 'Только для новых пользователей.',
    url: 'https://flex.ru/',
    expires: '2026-11-10',
    popular: 60,
    createdAt: '2026-10-04'
  },

  /* --- Банки --- */
  {
    id: 'tbank-1000',
    shop: 'Т-Банк',
    category: 'banks',
    title: '1000 ₽ новым клиентам',
    description: 'Бонус за оформление дебетовой карты.',
    discount: '1000 ₽',
    code: 'TBANK1000',
    conditions: 'Только для новых клиентов банка. Выплата после первой покупки.',
    url: 'https://www.tbank.ru/',
    expires: '2026-12-31',
    popular: 98,
    createdAt: '2026-10-01'
  },
  {
    id: 'alfa-2000',
    shop: 'Альфа-Банк',
    category: 'banks',
    title: '2000 ₽ кэшбэка за карту',
    description: 'Приветственный кэшбэк новым клиентам.',
    discount: '2000 ₽',
    code: 'ALFA2000',
    conditions: 'Новым клиентам. Требуется 3 покупки в первый месяц.',
    url: 'https://alfabank.ru/',
    expires: '2026-12-20',
    popular: 94,
    createdAt: '2026-10-02'
  },
  {
    id: 'vtb-1500',
    shop: 'ВТБ',
    category: 'banks',
    title: '1500 ₽ за оформление карты',
    description: 'Единоразовый бонус новым держателям карты ВТБ.',
    discount: '1500 ₽',
    code: 'VTB1500',
    conditions: 'Для новых клиентов. Выплата в течение 30 дней.',
    url: 'https://www.vtb.ru/',
    expires: '2026-12-31',
    popular: 80,
    createdAt: '2026-10-03'
  },

  /* --- Маркетплейсы --- */
  {
    id: 'ozon-500',
    shop: 'Ozon',
    category: 'marketplace',
    title: '500 ₽ на первый заказ',
    description: 'Скидка для новых покупателей Ozon.',
    discount: '500 ₽',
    code: 'OZON500',
    conditions: 'Только для новых аккаунтов. Заказ от 1500 ₽.',
    url: 'https://www.ozon.ru/',
    expires: '2026-12-31',
    popular: 96,
    createdAt: '2026-10-01'
  },
  {
    id: 'wb-10',
    shop: 'Wildberries',
    category: 'marketplace',
    title: '10% на первый заказ',
    description: 'Скидка на любую первую покупку в Wildberries.',
    discount: '10%',
    code: 'WB10',
    conditions: 'Новым покупателям. Максимальная скидка 1000 ₽.',
    url: 'https://www.wildberries.ru/',
    expires: '2026-11-30',
    popular: 90,
    createdAt: '2026-10-02'
  },
  {
    id: 'mega-1000',
    shop: 'Мегамаркет',
    category: 'marketplace',
    title: '1000 ₽ бонусами на первый заказ',
    description: 'Промокод на бонусы за первую покупку.',
    discount: '1000 бонусов',
    code: 'MEGA1000',
    conditions: 'Только для новых покупателей. Заказ от 3000 ₽.',
    url: 'https://megamarket.ru/',
    expires: '2026-12-15',
    popular: 84,
    createdAt: '2026-10-03'
  },
  {
    id: 'ym-500',
    shop: 'Яндекс Маркет',
    category: 'marketplace',
    title: '500 ₽ на первый заказ',
    description: 'Скидка для новых пользователей Яндекс Маркета.',
    discount: '500 ₽',
    code: 'YM500',
    conditions: 'Новым клиентам. Заказ от 1500 ₽.',
    url: 'https://market.yandex.ru/',
    expires: '2026-12-10',
    popular: 86,
    createdAt: '2026-10-04'
  },

  /* --- Путешествия --- */
  {
    id: 'ytravel-1500',
    shop: 'Яндекс Путешествия',
    category: 'travel',
    title: '1500 ₽ на первое бронирование отеля',
    description: 'Скидка на первую бронь через Яндекс Путешествия.',
    discount: '1500 ₽',
    code: 'YTRAVEL1500',
    conditions: 'Новым пользователям. Бронь от 5000 ₽.',
    url: 'https://travel.yandex.ru/',
    expires: '2026-12-31',
    popular: 75,
    createdAt: '2026-10-01'
  },
  {
    id: 'ostrovok-10',
    shop: 'Островок',
    category: 'travel',
    title: '10% на отели',
    description: 'Промокод на бронирование отелей по России и миру.',
    discount: '10%',
    code: 'OSTROV10',
    conditions: 'Максимальная скидка 2000 ₽. Для новых клиентов.',
    url: 'https://ostrovok.ru/',
    expires: '2026-12-20',
    popular: 72,
    createdAt: '2026-10-02'
  },
  {
    id: 'avia-1000',
    shop: 'Aviasales',
    category: 'travel',
    title: '1000 ₽ на авиабилеты',
    description: 'Промокод на первую покупку билетов.',
    discount: '1000 ₽',
    code: 'AVIA1000',
    conditions: 'Заказ от 10 000 ₽. Только для новых пользователей.',
    url: 'https://www.aviasales.ru/',
    expires: '2026-11-25',
    popular: 78,
    createdAt: '2026-10-03'
  },

  /* --- Игры --- */
  {
    id: 'steam-sale',
    shop: 'Steam',
    category: 'games',
    title: 'Скидки до 90% на хиты',
    description: 'Распродажа в Steam — тысячи игр со скидками.',
    discount: 'до 90%',
    code: '—',
    conditions: 'Скидка применяется автоматически в магазине.',
    url: 'https://store.steampowered.com/',
    expires: '2026-11-05',
    popular: 82,
    createdAt: '2026-10-04'
  },
  {
    id: 'psn-sale',
    shop: 'PlayStation Store',
    category: 'games',
    title: 'Скидки до 70% на игры',
    description: 'Акция в PlayStation Store для подписчиков PS Plus.',
    discount: 'до 70%',
    code: '—',
    conditions: 'Только для подписчиков PS Plus.',
    url: 'https://store.playstation.com/',
    expires: '2026-11-15',
    popular: 70,
    createdAt: '2026-10-05'
  },

  /* --- Подписки --- */
  {
    id: 'plus-60',
    shop: 'Яндекс Плюс',
    category: 'subs',
    title: '60 дней Плюса бесплатно',
    description: 'Два месяца подписки Яндекс Плюс без оплаты.',
    discount: '60 дней',
    code: 'PLUS60',
    conditions: 'Только для новых подписчиков. Автопродление отключается вручную.',
    url: 'https://plus.yandex.ru/',
    expires: '2026-12-31',
    popular: 92,
    createdAt: '2026-10-01'
  },
  {
    id: 'mts-30',
    shop: 'МТС Premium',
    category: 'subs',
    title: '30 дней бесплатно',
    description: 'Пробный период подписки МТС Premium.',
    discount: '30 дней',
    code: 'MTS30',
    conditions: 'Новым подписчикам. Далее по стандартной цене.',
    url: 'https://premium.mts.ru/',
    expires: '2026-12-05',
    popular: 65,
    createdAt: '2026-10-02'
  }
];

/* --------------------------------------------------------------------------
   DATA — загрузка и агрегаты
   -------------------------------------------------------------------------- */
const Data = {
  async load() {
    try {
      const res = await fetch(CONFIG.DATA_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length) {
          STATE.coupons = json;
          STATE.lastUpdate = new Date().toISOString();
          console.log('[Data] загружено из coupons.json:', json.length);
          return STATE.coupons;
        }
      }
    } catch (e) {
      // file:// или пустой coupons.json → используем mock
    }

    STATE.coupons = MOCK_COUPONS.slice();
    STATE.lastUpdate = new Date().toISOString();
    console.log('[Data] использую mock-купоны:', STATE.coupons.length);
    return STATE.coupons;
  },

  shops() {
    return [...new Set(STATE.coupons.map(c => c.shop))];
  },

  stats() {
    return {
      total: STATE.coupons.length,
      shops: Data.shops().length,
      updated: STATE.lastUpdate
    };
  },

  byId(id) {
    return STATE.coupons.find(c => c.id === id) || null;
  }
};

window.MOCK_COUPONS = MOCK_COUPONS;
window.Data = Data;