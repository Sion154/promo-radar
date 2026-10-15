\# PromoRadar Parser



Парсер промокодов на Python 3.8+. \*\*Только стандартная библиотека\*\* — никаких `pip install`.



\## Что делает



1\. Забирает купоны из источника (`mock` / `admitad` / `cityads` / `salesdoubler`).

2\. Мержит с уже существующим `data/coupons.json` — дедуп по `id`.

3\. Опционально постит \*\*новые\*\* купоны в VK-группу и Telegram-канал.



\## Запуск локально



```bash

\# Только превью, ничего не пишет

python parser/parser.py --dry-run



\# Записать в data/coupons.json

python parser/parser.py



\# Записать + постить новые купоны в VK/TG

python parser/parser.py --post



\# Другой источник

python parser/parser.py --source admitad



\# Ограничить количество новых

python parser/parser.py --limit 3

```



\## Переменные окружения для постинга



```bash

export VK\_ACCESS\_TOKEN="vk1.a...."

export VK\_GROUP\_ID="123456789"           # без минуса

export TG\_BOT\_TOKEN="123456:ABC-DEF..."

export TG\_CHAT\_ID="@promo\_radar"         # или "-1001234567890"

```



\## Формат `data/coupons.json`



```json

\[

&#x20; {

&#x20;   "id": "ozon-ozon500",

&#x20;   "shop": "Ozon",

&#x20;   "category": "marketplace",

&#x20;   "title": "500 ₽ на первый заказ",

&#x20;   "description": "Актуальное предложение от Ozon.",

&#x20;   "discount": "500 ₽",

&#x20;   "code": "OZON500",

&#x20;   "conditions": "Только для новых аккаунтов.",

&#x20;   "url": "https://www.ozon.ru/",

&#x20;   "expires": "2026-12-31",

&#x20;   "popular": 96,

&#x20;   "createdAt": "2026-10-01",

&#x20;   "source": "mock"

&#x20; }

]

```



\### Категории (поле `category`)



| id            | Название       |

|---------------|----------------|

| `food`        | Еда            |

| `cinema`      | Кино           |

| `banks`       | Банки          |

| `marketplace` | Маркетплейсы   |

| `travel`      | Путешествия    |

| `games`       | Игры           |

| `subs`        | Подписки       |



\## Подключение CPA-сети



В `parser.py` есть три класса-заглушки: `AdmitadSource`, `CityadsSource`,

`SalesDoublerSource`. Каждый уже умеет читать свой ключ из переменной окружения.

Нужно реализовать метод `fetch()` — вернуть список словарей по формату выше.



\### Admitad



1\. Получить `client\_id` и `client\_secret` в кабинете.

2\. Пройти OAuth: `POST https://api.admitad.com/token/` с `grant\_type=client\_credentials`.

3\. `GET https://api.admitad.com/coupons/?limit=100` с `Authorization: Bearer <token>`.

4\. Замапить поля ответа на формат купона.



\### Cityads / SalesDoubler



Аналогично: получить API-ключ, дёрнуть `/coupons` или XML-feed,

замапить в формат.



\## Формат постов



`format\_post\_vk()` и `format\_post\_tg()` в `parser.py` \*\*обязаны\*\* совпадать

с `VK.formatPost()` в `js/vk.js` и `TG.formatPost()` в `js/tg.js`.

Если меняешь один — меняй и второй.



\## Автозапуск



См. `.github/workflows/parser.yml`. Раз в сутки GitHub Actions:

1\. Устанавливает Python.

2\. Запускает `parser.py --post`.

3\. Коммитит изменённый `data/coupons.json` обратно в репозиторий.



Токены VK/TG хранятся в \*\*GitHub Secrets\*\*, не в коде.

