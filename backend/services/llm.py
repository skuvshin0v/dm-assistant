import os
from typing import Any

from openai import AsyncOpenAI
from pydantic import BaseModel, field_validator

PRICE_INPUT_RUB_PER_1M = 23.092
PRICE_OUTPUT_RUB_PER_1M = 138.551

SYSTEM_INSTRUCTION = """\
Ты — аналитический ассистент мастера настольной RPG. Твоя задача — извлечь
структурированные сущности и события из заметок мастера.

# ЗАГОЛОК ЗАПИСИ (поле ``record_title``)

- Одна строка по-русски, **до ~80 символов**: как мастеру подписать **весь** этот
  текст в списке источников, если бы это была одна карточка.
- Смотри на **целый** текст источника и на то, что ты извлекаешь: отрази общую
  тему или главный фокус, а не только первое событие или первое имя из списка.
- Если в заметке несколько равнозначных тем — нейтральное обобщение допустимо.
- Если по правилам ниже извлечение **полностью пустое** (OOC, планы, сослагательное)
  — кратко назови тему ввода по тексту или верни пустую строку ``""``.

# МЕТАДАННЫЕ ИСТОЧНИКА

- В user-сообщении иногда есть строка «Заголовок источника: …» (имя файла, документа).
  Используй как дополнительный контекст; при противоречии с телом текста приоритет у **тела**.

# ОБЩИЕ ПРАВИЛА

- Работай ТОЛЬКО с тем, что написано в тексте. Ничего не выдумывай.
- Нет собственного имени — нет сущности. Безымянные персонажи, локации и предметы
  («кузнец», «ближайшая деревня», «какой-то меч») не извлекаются.
- OOC-текст («давайте на следующей сессии», «мы играли с 19 до 23») → пустой результат.
- Планирование и сослагательное наклонение («может, добавим злодея?») → пустой результат.
- Расы/народы в целом («эльфы живут в лесах», «орки кочуют по степям») → пустой результат.
- В каждом ``quote`` клади короткую дословную цитату из текста.
- Если чего-то нет — оставляй пустые списки или null.
- **Имена — всегда с заглавной буквы.** Даже если в тексте строчные: «амулет Луны» → «Амулет Луны»,
  «лес Фарн» → «Лес Фарн», «серебряный топор» → «Серебряный топор».
- **«Партия», «игроки», «отряд» — не сущности.** Не пиши их ни в одно поле как имя персонажа,
  владельца, участника события или фракции. Если владелец/участник — только «Партия» → оставляй null/[].

# ИМЕНА

- Имя сущности — конкретное собственное имя или устойчивый уникальный идентификатор.
- Имя всегда пиши с заглавной буквы, даже если в тексте оно строчное.
- **Титул и собственное имя — раздельно.** «Барон Форлек» → name=«Форлек», titles=[«Барон»].
  «Великий магистр Эрвин» → name=«Эрвин», titles=[«Великий магистр»].
  Эпитет/прозвище без явного титула («Кровавый», «Железный») — часть name, не titles.
- Безымянные описания («наставник», «дочь трактирщика», «кузнец», «один из стражников») —
  не извлекай. Нет уникального имени — нет сущности.

# CHARACTER

Персонаж — **именованный** индивид в мире: человек, эльф, дварф, дракон, бог, лич — всё,
у чего есть собственное имя и кто действует как лицо. Имя + профессия/занятие («Хорт — кузнец»)
достаточно, чтобы создать персонажа.

**``name``** — собственное имя без титула; фамилия — **часть имени**, не отрезай.
  «Колин Гаррет» → name=«Колин Гаррет» (Гаррет — фамилия). Отделяй только явные
  должностные титулы (барон, граф, капитан, магистр, король и т.п.).
**``titles``** — список титулов/чинов отдельно от имени. Примеры: [«Барон»], [«Сир», «Лорд-протектор»].
**``aliases``** — другие имена/прозвища из текста, которыми зовут того же персонажа. Не выдумывать.

**``role``**:
- ``player`` — явно PC или «персонаж игрока».
- ``npc`` — все остальные именованные персонажи, включая богов, драконов, демонов, духов и любых
  нечеловеческих существ с именем.
- ``unknown`` — буквально неясно, PC это или NPC («непонятно, игрок это или мастерский персонаж»,
  «ещё не решено»). Неизвестные мотивы или фракция — НЕ основание для ``unknown``.

**``species``** — природа существа; выбирай из enum, не оставляй ``unknown`` если вид понятен:
  human / elf / dwarf / halfling / gnome / orc / goblinoid /
  dragon / demon / deity / undead / construct / spirit /
  beast / monster / other / unknown.

**``npc_kind``** — драматическая роль в истории; заполнять только для ``role=npc``:
  villain / boss / ally / patron / quest_giver / merchant / authority / commoner / rival / deity / other
  Если роль неясна — оставляй ``null``, не угадывай.

**``status``** — alive / dead / unknown (дефолт ``unknown``).

**``current_location_name``** — где персонаж **сейчас**. Только явное настоящее.
**``origin_location_name``** — откуда родом.
**``affiliation_faction_names``** — только явная принадлежность.
**``description``** — 1–2 предложения: внешность, манера, если явно описаны.
**``key_facts``** — конкретные факты, не умещающиеся в структурные поля.

# FACTION

**``kind``**: cult / guild / order / clan / dynasty / family / government / military / religious / criminal / merchant / secret_society / party / other
**``scale``**: local / regional / state / world / null
**``status``**: active / disbanded / underground / unknown / null
**``goals``** — цели фракции из текста.
**``leader_character_names``** — только конкретные имена персонажей-лидеров.
**``headquarters_location_name``** — штаб/главная база.
**``relations``** — список связей: [{target_kind: "faction"|"character", target_name, kind: "allied"|"hostile"|"vassal"|"rival"|"neutral"|"serves"|"patron", note}]

# LOCATION

**``level``**: plane / world / continent / region / state / settlement / district / site / building / room / null
**``subtype``** — чем место является по природе (свободный текст на русском).
**``status``**: destroyed / abandoned / hidden / unknown / null
**``parent_location_name``** — только прямой контейнер.
**``terrain_type``**: forest / swamp / mountains / hills / plains / desert / tundra / jungle / coast / island / river / lake / sea / ocean / cave / underdark / wasteland / volcanic / magical_anomaly / null
**``controlled_by_faction_name``** — кто контролирует это место.

# ITEM / ARTIFACT

**``kind``**: artifact / item
**``aliases``** — другие названия.
**``description``** — что это и как выглядит.
**``key_facts``** — магические свойства, история, условия использования.
**``owner_character_name``** — текущий владелец-персонаж.
**``owner_faction_name``** — текущая фракция-владелец.
**``held_by_party``** — true если у партии.
**``current_location_name``** — физическое место предмета.
**``status``**: active / lost / destroyed / hidden / unknown / null

# ПРИОРИТЕТ

Точность важнее полноты. При сомнении — пропусти.

Отвечай ТОЛЬКО валидным JSON без markdown-обёрток:
{
  "record_title": "...",
  "characters": [...],
  "factions": [...],
  "locations": [...],
  "items": [...],
  "events": []
}
"""


class CharacterSchema(BaseModel):
    name: str
    titles: list[str] = []
    aliases: list[str] = []
    role: str = "npc"
    species: str | None = None
    npc_kind: str | None = None
    status: str | None = None
    description: str | None = None
    current_location_name: str | None = None
    origin_location_name: str | None = None
    affiliation_faction_names: list[str] = []
    key_facts: list[str] = []

    @field_validator("role", mode="before")
    @classmethod
    def v_role(cls, v: Any) -> str:
        return v if v in {"player", "npc", "unknown"} else "npc"

    @field_validator("npc_kind", mode="before")
    @classmethod
    def v_npc_kind(cls, v: Any) -> str | None:
        valid = {"villain","boss","ally","patron","quest_giver","merchant","authority","commoner","rival","deity","other"}
        return v if v in valid else None

    @field_validator("status", mode="before")
    @classmethod
    def v_status(cls, v: Any) -> str | None:
        return v if v in {"alive", "dead", "unknown"} else None


class LocationSchema(BaseModel):
    name: str
    description: str | None = None
    status: str | None = None
    level: str | None = None
    subtype: str | None = None
    terrain_type: str | None = None
    parent_location_name: str | None = None
    controlled_by_faction_name: str | None = None

    @field_validator("level", mode="before")
    @classmethod
    def v_level(cls, v: Any) -> str | None:
        valid = {"plane","world","continent","region","state","settlement","district","site","building","room"}
        return v if v in valid else None

    @field_validator("status", mode="before")
    @classmethod
    def v_status(cls, v: Any) -> str | None:
        return v if v in {"destroyed", "abandoned", "hidden", "unknown"} else None

    @field_validator("terrain_type", mode="before")
    @classmethod
    def v_terrain(cls, v: Any) -> str | None:
        valid = {"forest","swamp","mountains","hills","plains","desert","tundra","jungle","coast","island","river","lake","sea","ocean","cave","underdark","wasteland","volcanic","magical_anomaly"}
        return v if v in valid else None


class FactionSchema(BaseModel):
    name: str
    description: str | None = None
    status: str | None = None
    kind: str | None = None
    scale: str | None = None
    goals: list[str] = []
    headquarters_location_name: str | None = None
    leader_character_names: list[str] = []
    relations: list[dict[str, Any]] = []

    @field_validator("status", mode="before")
    @classmethod
    def v_status(cls, v: Any) -> str | None:
        return v if v in {"active", "disbanded", "underground", "unknown"} else None

    @field_validator("kind", mode="before")
    @classmethod
    def v_kind(cls, v: Any) -> str | None:
        valid = {"cult","guild","order","clan","dynasty","family","government","military","religious","criminal","merchant","secret_society","party","other"}
        return v if v in valid else None

    @field_validator("scale", mode="before")
    @classmethod
    def v_scale(cls, v: Any) -> str | None:
        return v if v in {"local", "regional", "state", "world"} else None


class ItemSchema(BaseModel):
    name: str
    description: str | None = None
    status: str | None = None
    kind: str = "item"
    aliases: list[str] = []
    key_facts: list[str] = []
    held_by_party: bool = False
    owner_character_name: str | None = None
    owner_faction_name: str | None = None
    current_location_name: str | None = None

    @field_validator("status", mode="before")
    @classmethod
    def v_status(cls, v: Any) -> str | None:
        return v if v in {"active", "lost", "destroyed", "hidden", "unknown"} else None

    @field_validator("kind", mode="before")
    @classmethod
    def v_kind(cls, v: Any) -> str:
        return v if v in {"artifact", "item"} else "item"


class LLMResult(BaseModel):
    record_title: str
    characters: list[CharacterSchema] = []
    locations: list[LocationSchema] = []
    factions: list[FactionSchema] = []
    items: list[ItemSchema] = []


def _build_user_message(text: str, existing_entities: list[dict[str, Any]]) -> str:
    import json
    existing_json = json.dumps(existing_entities, ensure_ascii=False, indent=2)
    return f"{text}\n\nСуществующие сущности мира:\n{existing_json}"


async def extract_entities(
    text: str, existing_entities: list[dict[str, Any]]
) -> tuple[dict[str, Any], dict[str, Any]]:
    client = AsyncOpenAI(
        api_key=os.environ["LLM_API_KEY"],
        base_url=os.environ["LLM_BASE_URL"],
    )
    model = os.environ.get("LLM_MODEL", "google/gemini-3.1-flash-lite")

    response = await client.beta.chat.completions.parse(
        model=model,
        response_format=LLMResult,
        messages=[
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": _build_user_message(text, existing_entities)},
        ],
    )

    result: LLMResult = response.choices[0].message.parsed
    usage = response.usage
    input_tokens = usage.prompt_tokens if usage else 0
    output_tokens = usage.completion_tokens if usage else 0
    cost_rub = (input_tokens * PRICE_INPUT_RUB_PER_1M + output_tokens * PRICE_OUTPUT_RUB_PER_1M) / 1_000_000

    usage_info = {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_rub": round(cost_rub, 4),
    }
    return result.model_dump(), usage_info
