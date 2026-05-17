from typing import Any

from supabase import AsyncClient


class EntityRef:
    def __init__(self, entity_id: str, entity_type: str, table: str):
        self.id = entity_id
        self.type = entity_type
        self.table = table


async def get_world_entities_by_name(
    client: AsyncClient, world_id: str
) -> dict[str, EntityRef]:
    tables = [
        ("characters", "character"),
        ("factions", "faction"),
        ("locations", "location"),
        ("items", "item"),
    ]
    result: dict[str, EntityRef] = {}
    for table, entity_type in tables:
        resp = (
            await client.table(table)
            .select("id, name")
            .eq("world_id", world_id)
            .limit(100)
            .execute()
        )
        for row in resp.data or []:
            key = row["name"].strip().lower()
            result[key] = EntityRef(row["id"], entity_type, table)
    return result


def match_entity(name: str, existing: dict[str, EntityRef]) -> EntityRef | None:
    return existing.get(name.strip().lower())


def get_existing_for_llm(existing: dict[str, EntityRef]) -> list[dict[str, Any]]:
    return [
        {"id": ref.id, "type": ref.type, "name": name}
        for name, ref in existing.items()
    ]
