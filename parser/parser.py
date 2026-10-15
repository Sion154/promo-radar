#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PromoRadar — парсер промокодов.

Python 3.8+, только стандартная библиотека (urllib, json, pathlib, argparse).

Запуск:
    python parser/parser.py --dry-run              # печать, без записи и постинга
    python parser/parser.py                        # записать в data/coupons.json
    python parser/parser.py --post                 # записать + постить новые в VK и TG
    python parser/parser.py --source admitad       # выбрать источник
    python parser/parser.py --limit 5              # ограничить количество новых купонов

Переменные окружения для постинга:
    VK_ACCESS_TOKEN, VK_GROUP_ID
    TG_BOT_TOKEN, TG_CHAT_ID
"""

import os
import sys
import json
import time
import random
import argparse
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path

# ==========================================================================
# КОНСТАНТЫ
# ==========================================================================

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "coupons.json"
SITE_URL = "https://promo-radar.example"  # заменишь после деплоя

USER_AGENT = "PromoRadarBot/1.0 (+https://promo-radar.example)"
HTTP_TIMEOUT = 20

CATEGORIES = {
    "food":        "Еда",
    "cinema":      "Кино",
    "banks":       "Банки",
    "marketplace": "Маркетплейсы",
    "travel":      "Путешествия",
    "games":       "Игры",
    "subs":        "Подписки",
}

# ==========================================================================
# MOCK-ШАБЛОНЫ (используются, если CPA API не настроен)
# ==========================================================================

MOCK_TEMPLATES = [
    # --- Еда ---
    dict(shop="Купер", category="food", title="500 ₽ на первый заказ от 1500 ₽",
         discount="500 ₽", code="KUPER500", url="https://kuper.ru/",
         conditions="Только для новых клиентов. Минимальная сумма заказа — 1500 ₽."),
    dict(shop="Самокат", category="food", title="300 ₽ на первый заказ",
         discount="300 ₽", code="SAMOKAT300", url="https://samokat.ru/",
         conditions="Для новых пользователей. Заказ от 800 ₽."),
    dict(shop="Додо Пицца", category="food", title="Вторая пицца в подарок",
         discount="2 по цене 1", code="DODO2X1", url="https://dodopizza.ru/",
         conditions="Участвует ограниченный выбор пицц."),
    dict(shop="Яндекс Еда", category="food", title="400 ₽ на заказ от 1000 ₽",
         discount="400 ₽", code="EDA400", url="https://eda.yandex.ru/",
         conditions="Только для новых аккаунтов."),

    # --- Кино ---
    dict(shop="Premier", category="cinema", title="30 дней подписки бесплатно",
         discount="30 дней", code="PREMIER30", url="https://premier.one/",
         conditions="Только для новых подписчиков."),
    dict(shop="START", category="cinema", title="14 дней бесплатно",
         discount="14 дней", code="START14", url="https://start.ru/",
         conditions="Новым пользователям. Карта не требуется."),
    dict(shop="Amediateka", category="cinema", title="30 дней за 1 ₽",
         discount="30 дней за 1 ₽", code="AMED1", url="https://www.amediateka.ru/",
         conditions="Для новых подписчиков."),

    # --- Банки ---
    dict(shop="Т-Банк", category="banks", title="1000 ₽ новым клиентам",
         discount="1000 ₽", code="TBANK1000", url="https://www.tbank.ru/",
         conditions="Выплата после первой покупки."),
    dict(shop="Альфа-Банк", category="banks", title="2000 ₽ кэшбэка за карту",
         discount="2000 ₽", code="ALFA2000", url="https://alfabank.ru/",
         conditions="Требуется 3 покупки в первый месяц."),
    dict(shop="ВТБ", category="banks", title="1500 ₽ за оформление карты",
         discount="1500 ₽", code="VTB1500", url="https://www.vtb.ru/",
         conditions="Для новых клиентов. Выплата в течение 30 дней."),

    # --- Маркетплейсы ---
    dict(shop="Ozon", category="marketplace", title="500 ₽ на первый заказ",
         discount="500 ₽", code="OZON500", url="https://www.ozon.ru/",
         conditions="Только для новых аккаунтов. Заказ от 1500 ₽."),
    dict(shop="Wildberries", category="marketplace", title="10% на первый заказ",
         discount="10%", code="WB10", url="https://www.wildberries.ru/",
         conditions="Максимальная скидка 1000 ₽."),
    dict(shop="Мегамаркет", category="marketplace", title="1000 ₽ бонусами на первый заказ",
         discount="1000 бонусов", code="MEGA1000", url="https://megamarket.ru/",
         conditions="Только для новых покупателей. Заказ от 3000 ₽."),

    # --- Путешествия ---
    dict(shop="Яндекс Путешествия", category="travel", title="1500 ₽ на первое бронирование отеля",
         discount="1500 ₽", code="YTRAVEL1500", url="https://travel.yandex.ru/",
         conditions="Бронь от 5000 ₽."),
    dict(shop="Островок", category="travel", title="10% на отели",
         discount="10%", code="OSTROV10", url="https://ostrovok.ru/",
         conditions="Максимальная скидка 2000 ₽."),

    # --- Игры ---
    dict(shop="Steam", category="games", title="Скидки до 90% на хиты",
         discount="до 90%", code="—", url="https://store.steampowered.com/",
         conditions="Скидка применяется автоматически."),

    # --- Подписки ---
    dict(shop="Яндекс Плюс", category="subs", title="60 дней Плюса бесплатно",
         discount="60 дней", code="PLUS60", url="https://plus.yandex.ru/",
         conditions="Только для новых подписчиков."),
    dict(shop="МТС Premium", category="subs", title="30 дней бесплатно",
         discount="30 дней", code="MTS30", url="https://premium.mts.ru/",
         conditions="Новым подписчикам."),
]

# ==========================================================================
# ИСТОЧНИКИ ДАННЫХ (CPA-сети)
# ==========================================================================

class BaseSource:
    """Базовый интерфейс источника купонов."""
    name = "base"

    def fetch(self):
        """Должен вернуть список словарей с полями купона."""
        raise NotImplementedError


class MockSource(BaseSource):
    """Тестовые купоны. Не требует API."""
    name = "mock"

    def fetch(self):
        now = datetime.now(timezone.utc)
        coupons = []
        for i, tpl in enumerate(MOCK_TEMPLATES):
            expires = (now + timedelta(days=random.randint(10, 60))).strftime("%Y-%m-%d")
            created = (now - timedelta(days=random.randint(0, 5))).strftime("%Y-%m-%d")

            shop = tpl["shop"]
            code = tpl["code"]
            cid = make_id(shop, code)

            coupons.append({
                "id": cid,
                "shop": shop,
                "category": tpl["category"],
                "title": tpl["title"],
                "description": f"Актуальное предложение от {shop}.",
                "discount": tpl["discount"],
                "code": code,
                "conditions": tpl["conditions"],
                "url": tpl["url"],
                "expires": expires,
                "popular": random.randint(60, 99),
                "createdAt": created,
                "source": "mock",
            })
        return coupons


class AdmitadSource(BaseSource):
    """
    Интерфейс под Admitad (https://www.admitad.com/).

    Реализация зависит от выбранного формата: CPA API, XML-feed или
    продукты по токену. Сейчас — заглушка, возвращает [].

    Как включить:
      1. Получить client_id, client_secret, scope в кабинете Admitad.
      2. Реализовать OAuth-флоу для access_token.
      3. Заменить тело fetch() на запрос к API + маппинг полей.
    """
    name = "admitad"

    def __init__(self, client_id=None, client_secret=None):
        self.client_id = client_id or os.environ.get("ADMITAD_CLIENT_ID")
        self.client_secret = client_secret or os.environ.get("ADMITAD_CLIENT_SECRET")

    def fetch(self):
        if not self.client_id or not self.client_secret:
            log("Admitad: нет credentials, пропускаю")
            return []
        # TODO: OAuth + GET /coupons/ или /products/
        log("Admitad: реализация API ещё не подключена")
        return []


class CityadsSource(BaseSource):
    """Интерфейс под Cityads. Заглушка."""
    name = "cityads"

    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get("CITYADS_API_KEY")

    def fetch(self):
        if not self.api_key:
            log("Cityads: нет API-ключа, пропускаю")
            return []
        log("Cityads: реализация API ещё не подключена")
        return []


class SalesDoublerSource(BaseSource):
    """Интерфейс под SalesDoubler. Заглушка."""
    name = "salesdoubler"

    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get("SALESDOUBLER_API_KEY")

    def fetch(self):
        if not self.api_key:
            log("SalesDoubler: нет API-ключа, пропускаю")
            return []
        log("SalesDoubler: реализация API ещё не подключена")
        return []


def get_source(name):
    sources = {
        "mock": MockSource,
        "admitad": AdmitadSource,
        "cityads": CityadsSource,
        "salesdoubler": SalesDoublerSource,
    }
    cls = sources.get(name)
    if not cls:
        log(f"Неизвестный источник: {name}, использую mock")
        cls = MockSource
    return cls()


# ==========================================================================
# УТИЛИТЫ
# ==========================================================================

def log(*args):
    print(*args, flush=True)


def make_id(shop, code):
    """Стабильный id из магазина и промокода."""
    raw = f"{shop}-{code}".lower()
    slug = "".join(ch if ch.isalnum() else "-" for ch in raw)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def http_post(url, data, headers=None, as_json=True):
    """POST-запрос на urllib. Возвращает (ok, response_dict_or_text)."""
    if as_json:
        body = json.dumps(data).encode("utf-8")
        hdrs = {"Content-Type": "application/json", "User-Agent": USER_AGENT}
    else:
        body = urllib.parse.urlencode(data).encode("utf-8")
        hdrs = {"Content-Type": "application/x-www-form-urlencoded", "User-Agent": USER_AGENT}

    if headers:
        hdrs.update(headers)

    req = urllib.request.Request(url, data=body, headers=hdrs, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            try:
                return True, json.loads(raw)
            except json.JSONDecodeError:
                return True, raw
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode('utf-8', errors='replace')}"
    except urllib.error.URLError as e:
        return False, f"URLError: {e.reason}"
    except Exception as e:
        return False, f"Error: {e}"


# ==========================================================================
# ФОРМАТ ПОСТОВ — ДОЛЖЕН СОВПАДАТЬ С JS (js/vk.js, js/tg.js)
# ==========================================================================

def expires_text(date_str):
    """Человеческое описание срока годности. Дублирует Utils.expiresText в JS."""
    if not date_str:
        return "Бессрочно"
    try:
        target = datetime.strptime(date_str, "%Y-%m-%d").replace(
            hour=23, minute=59, second=59, tzinfo=timezone.utc
        )
    except ValueError:
        return "Бессрочно"

    now = datetime.now(timezone.utc)
    days = (target - now).days
    if days < 0:
        return "Истёк"
    if days == 0:
        return "Истекает сегодня"
    if days == 1:
        return "Остался 1 день"
    if days < 5:
        return f"Осталось {days} дня"
    return f"До {target.strftime('%d.%m')}"


def category_title(cat_id):
    return CATEGORIES.get(cat_id, cat_id)


def hashtag_cat(cat_id):
    return category_title(cat_id).lower().replace(" ", "")


def format_post_vk(c):
    """Формат поста для VK. Должен совпадать с VK.formatPost в js/vk.js."""
    lines = []
    lines.append(f"🔥 {c['shop']} — {c.get('discount', 'скидка')}")
    lines.append("")
    lines.append(c.get("title", ""))

    if c.get("description"):
        lines.append("")
        lines.append(c["description"])

    code = c.get("code")
    if code and code != "—":
        lines.append("")
        lines.append(f"🎟 Промокод: {code}")

    if c.get("conditions"):
        lines.append("")
        lines.append(f"⚡ {c['conditions']}")

    lines.append("")
    lines.append(f"⏰ {expires_text(c.get('expires'))}")
    lines.append("")
    lines.append(f"👉 {c.get('url') or SITE_URL}")
    lines.append("")
    lines.append(f"#промокоды #скидки #{hashtag_cat(c.get('category', ''))}")
    return "\n".join(lines)


def format_post_tg(c):
    """
    Формат поста для Telegram (legacy Markdown, parse_mode='Markdown').
    Должен совпадать с TG.formatPost в js/tg.js.
    """
    lines = []
    lines.append(f"🔥 *{c['shop']}* — {c.get('discount', 'скидка')}")
    lines.append("")
    lines.append(c.get("title", ""))

    if c.get("description"):
        lines.append("")
        lines.append(c["description"])

    code = c.get("code")
    if code and code != "—":
        lines.append("")
        lines.append(f"🎟 Промокод: `{code}`")

    if c.get("conditions"):
        lines.append("")
        lines.append(f"⚡ {c['conditions']}")

    lines.append("")
    lines.append(f"⏰ {expires_text(c.get('expires'))}")
    lines.append("")
    lines.append(f"👉 [Перейти в магазин]({c.get('url') or SITE_URL})")
    lines.append("")
    lines.append(f"#промокоды #скидки #{hashtag_cat(c.get('category', ''))}")
    return "\n".join(lines)


# ==========================================================================
# ПУБЛИКАЦИЯ
# ==========================================================================

def post_vk(c, token=None, group_id=None):
    token = token or os.environ.get("VK_ACCESS_TOKEN")
    group_id = group_id or os.environ.get("VK_GROUP_ID")
    if not token or not group_id:
        return False, "VK: нет VK_ACCESS_TOKEN или VK_GROUP_ID"

    params = {
        "owner_id": f"-{group_id}",
        "from_group": "1",
        "message": format_post_vk(c),
        "v": "5.199",
        "access_token": token,
    }
    if c.get("url"):
        params["attachments"] = c["url"]

    ok, data = http_post("https://api.vk.com/method/wall.post", params, as_json=False)
    if not ok:
        return False, f"VK: {data}"
    if isinstance(data, dict) and data.get("error"):
        return False, f"VK: {data['error'].get('error_msg', data['error'])}"
    post_id = data.get("response", {}).get("post_id") if isinstance(data, dict) else None
    return True, f"VK: post_id={post_id}"


def post_tg(c, token=None, chat_id=None):
    token = token or os.environ.get("TG_BOT_TOKEN")
    chat_id = chat_id or os.environ.get("TG_CHAT_ID")
    if not token or not chat_id:
        return False, "TG: нет TG_BOT_TOKEN или TG_CHAT_ID"

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": format_post_tg(c),
        "parse_mode": "Markdown",
        "disable_web_page_preview": False,
    }
    if c.get("url"):
        payload["reply_markup"] = {
            "inline_keyboard": [[
                {"text": "🛍 Перейти в магазин", "url": c["url"]}
            ]]
        }

    ok, data = http_post(url, payload, as_json=True)
    if not ok:
        return False, f"TG: {data}"
    if isinstance(data, dict) and not data.get("ok"):
        return False, f"TG: {data.get('description', 'unknown error')}"
    msg_id = data.get("result", {}).get("message_id") if isinstance(data, dict) else None
    return True, f"TG: message_id={msg_id}"


# ==========================================================================
# ФАЙЛ
# ==========================================================================

def load_existing():
    if not DATA_FILE.exists():
        return []
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception as e:
        log(f"Ошибка чтения {DATA_FILE}: {e}")
        return []


def save_coupons(coupons):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(coupons, ensure_ascii=False, indent=2)
    DATA_FILE.write_text(text, encoding="utf-8")
    log(f"Записано {len(coupons)} купонов в {DATA_FILE}")


def merge(old, new):
    """Возвращает (all_coupons, new_ids). Дедуп по id, старые приоритетнее."""
    by_id = {c["id"]: c for c in old if c.get("id")}
    new_ids = []

    for c in new:
        cid = c.get("id")
        if not cid:
            continue
        if cid in by_id:
            by_id[cid].update({
                "title": c.get("title", by_id[cid].get("title")),
                "discount": c.get("discount", by_id[cid].get("discount")),
                "conditions": c.get("conditions", by_id[cid].get("conditions")),
                "expires": c.get("expires", by_id[cid].get("expires")),
                "popular": c.get("popular", by_id[cid].get("popular")),
            })
        else:
            by_id[cid] = c
            new_ids.append(cid)

    return list(by_id.values()), new_ids


# ==========================================================================
# CLI
# ==========================================================================

def main():
    ap = argparse.ArgumentParser(description="PromoRadar parser")
    ap.add_argument("--source", default="mock",
                    choices=["mock", "admitad", "cityads", "salesdoubler"],
                    help="Источник купонов (default: mock)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Не писать файл и не постить, только вывести")
    ap.add_argument("--post", action="store_true",
                    help="Постить новые купоны в VK и TG")
    ap.add_argument("--limit", type=int, default=0,
                    help="Ограничить количество новых купонов (0 = без лимита)")
    ap.add_argument("--seed", type=int, default=None,
                    help="Seed для воспроизводимости mock")
    args = ap.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    log("=== PromoRadar parser ===")
    log(f"Источник: {args.source}")

    source = get_source(args.source)
    fresh = source.fetch()
    log(f"Получено купонов от источника: {len(fresh)}")

    if not fresh:
        log("Нет данных. Выход.")
        return 0

    old = load_existing()
    log(f"В файле уже: {len(old)}")

    merged, new_ids = merge(old, fresh)
    log(f"Новых: {len(new_ids)}")

    if args.limit and args.limit > 0:
        new_ids = new_ids[:args.limit]
        keep_ids = {c["id"] for c in old} | set(new_ids)
        merged = [c for c in merged if c["id"] in keep_ids]
        log(f"Ограничил новыми до: {len(new_ids)}")

    log("")
    log("--- Превью первого купона (VK) ---")
    if merged:
        sample = next((c for c in merged if c["id"] in new_ids), merged[0])
        log(format_post_vk(sample))
        log("")
        log("--- Превью первого купона (TG) ---")
        log(format_post_tg(sample))

    if args.dry_run:
        log("")
        log("[dry-run] файл не записан, постинг пропущен")
        return 0

    save_coupons(merged)

    if args.post and new_ids:
        log("")
        log(f"Пощу {len(new_ids)} новых купонов...")
        for cid in new_ids:
            c = next((x for x in merged if x["id"] == cid), None)
            if not c:
                continue
            ok_vk, msg_vk = post_vk(c)
            log(f"  [{cid}] {msg_vk}")
            ok_tg, msg_tg = post_tg(c)
            log(f"  [{cid}] {msg_tg}")
            time.sleep(1)
    elif args.post:
        log("Нет новых купонов — постить нечего.")

    return 0


if __name__ == "__main__":
    sys.exit(main())