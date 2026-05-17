# API — DM Assistant Backend

Base URL: `http://localhost:8000` (dev)

## Auth

Все защищённые эндпоинты требуют заголовок:

```
Authorization: Bearer <supabase_access_token>
```

Токен получается из `supabase.auth.getSession()` на фронтенде. Бэкенд валидирует подпись через `SUPABASE_JWT_SECRET`.

---

## GET /health

Проверка живости сервиса.

**Response 200:**
```json
{"status": "ok"}
```

---

## POST /record

Извлекает сущности из заметки мастера через LLM. Сохраняет сообщение в `messages`. Возвращает proposals — список предложений (создать/обновить сущности).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "text": "Варрен — старый маг, живёт в Серой Башне на краю Финемера",
  "world_id": "uuid",
  "campaign_id": "uuid",
  "chat_id": "uuid"
}
```

**Response 200:**
```json
{
  "record_title": "Знакомство с Варреном в Серой Башне",
  "message_id": "uuid",
  "proposals": [
    {
      "action": "create",
      "type": "character",
      "entity_id": null,
      "name": "Варрен",
      "description": "Старый маг",
      "status": "alive",
      "data": {
        "role": "npc",
        "species": "human",
        "npc_kind": "ally",
        "titles": [],
        "aliases": [],
        "key_facts": [],
        "current_location_name": "Серая Башня",
        "origin_location_name": null,
        "affiliation_faction_names": []
      }
    },
    {
      "action": "create",
      "type": "location",
      "entity_id": null,
      "name": "Серая Башня",
      "description": null,
      "status": null,
      "data": {
        "level": "building",
        "subtype": "башня",
        "terrain_type": null,
        "parent_location_name": "Финемер",
        "controlled_by_faction_name": null
      }
    }
  ]
}
```

**Errors:**
- `401` — отсутствует или невалидный токен
- `403` — world не принадлежит пользователю

---

## POST /record/confirm

Сохраняет принятые proposals в БД. Создаёт сущности в правильном порядке (location → faction → character → item), разрешает name-refs в FK-ссылки, создаёт `entity_relations` и `source`.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "accepted_proposals": [
    {
      "action": "create",
      "type": "character",
      "entity_id": null,
      "name": "Варрен",
      "description": "Старый маг",
      "status": "alive",
      "data": { ... }
    }
  ],
  "world_id": "uuid",
  "campaign_id": "uuid",
  "chat_id": "uuid",
  "message_id": "uuid",
  "original_text": "Варрен — старый маг, живёт в Серой Башне..."
}
```

**Response 200:**
```json
{
  "created_count": 2
}
```

**Что создаётся:**
1. Сущности в `locations`, `factions`, `characters`, `items` (в этом порядке)
2. Записи в `entity_relations` (членство, лидерство, межфракционные связи)
3. Запись в `sources` (если `accepted_proposals` не пустой)

**Errors:**
- `401` — невалидный токен
- `403` — world не принадлежит пользователю

---

## Порядок name→ID resolution в /record/confirm

При создании сущностей name-поля (например `current_location_name`) разрешаются в FK-ID следующим образом:

1. Сначала ищется в `created_by_name` — таблица только что созданных в этом запросе сущностей
2. Затем ищется в `existing` — существующие сущности мира (case-insensitive, strip)
3. Если не найдено — FK остаётся `null`

Это позволяет ссылаться на сущности из одного батча между собой.
