import json
import os
from typing import Any, Literal
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_async_client

from auth import get_user_id
from services.entities import (
    EntityRef,
    get_world_entities_by_name,
    get_existing_for_llm,
    match_entity,
)
from services.llm import extract_entities

router = APIRouter()


# ---------------------------------------------------------------------------
# Shared models
# ---------------------------------------------------------------------------

class Proposal(BaseModel):
    action: Literal["create", "update"]
    type: Literal["character", "location", "faction", "item"]
    entity_id: str | None = None
    name: str
    description: str | None = None
    status: str | None = None
    data: dict[str, Any] = {}


# ---------------------------------------------------------------------------
# POST /record
# ---------------------------------------------------------------------------

class RecordRequest(BaseModel):
    text: str
    world_id: str
    campaign_id: str
    chat_id: str


class RecordResponse(BaseModel):
    record_title: str
    proposals: list[Proposal]
    message_id: str
    assistant_message_id: str
    usage: dict
    raw_llm: dict


@router.post("/record", response_model=RecordResponse)
async def record(body: RecordRequest, user_id: str = Depends(get_user_id)):
    client = await create_async_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    # Verify world ownership
    world = await client.table("worlds").select("id").eq("id", body.world_id).eq("user_id", user_id).maybe_single().execute()
    if not world.data:
        raise HTTPException(status_code=403, detail="World not found or access denied")

    # Save user message
    msg = await client.table("messages").insert({
        "chat_id": body.chat_id,
        "role": "user",
        "content": body.text,
    }).execute()
    message_id: str = msg.data[0]["id"]

    # Fetch existing entities for context
    existing = await get_world_entities_by_name(client, body.world_id)
    existing_for_llm = get_existing_for_llm(existing)

    # Extract entities via LLM
    llm_result, llm_usage = await extract_entities(body.text, existing_for_llm)
    record_title: str = llm_result.get("record_title", "")

    proposals: list[Proposal] = []

    for char in llm_result.get("characters", []):
        name = char.get("name", "")
        ref = match_entity(name, existing)
        proposals.append(Proposal(
            action="update" if ref else "create",
            type="character",
            entity_id=ref.id if ref else None,
            name=name,
            description=char.get("description"),
            status=char.get("status"),
            data={
                "titles": char.get("titles", []),
                "aliases": char.get("aliases", []),
                "role": char.get("role", "npc"),
                "species": char.get("species", "unknown"),
                "npc_kind": char.get("npc_kind"),
                "key_facts": char.get("key_facts", []),
                "current_location_name": char.get("current_location_name"),
                "origin_location_name": char.get("origin_location_name"),
                "affiliation_faction_names": char.get("affiliation_faction_names", []),
            },
        ))

    for faction in llm_result.get("factions", []):
        name = faction.get("name", "")
        ref = match_entity(name, existing)
        proposals.append(Proposal(
            action="update" if ref else "create",
            type="faction",
            entity_id=ref.id if ref else None,
            name=name,
            description=faction.get("description"),
            status=faction.get("status"),
            data={
                "kind": faction.get("kind"),
                "scale": faction.get("scale"),
                "goals": faction.get("goals", []),
                "leader_character_names": faction.get("leader_character_names", []),
                "headquarters_location_name": faction.get("headquarters_location_name"),
                "relations": faction.get("relations", []),
            },
        ))

    for loc in llm_result.get("locations", []):
        name = loc.get("name", "")
        ref = match_entity(name, existing)
        proposals.append(Proposal(
            action="update" if ref else "create",
            type="location",
            entity_id=ref.id if ref else None,
            name=name,
            description=loc.get("description"),
            status=loc.get("status"),
            data={
                "level": loc.get("level"),
                "subtype": loc.get("subtype"),
                "terrain_type": loc.get("terrain_type"),
                "parent_location_name": loc.get("parent_location_name"),
                "controlled_by_faction_name": loc.get("controlled_by_faction_name"),
            },
        ))

    for item in llm_result.get("items", []):
        name = item.get("name", "")
        ref = match_entity(name, existing)
        proposals.append(Proposal(
            action="update" if ref else "create",
            type="item",
            entity_id=ref.id if ref else None,
            name=name,
            description=item.get("description"),
            status=item.get("status"),
            data={
                "kind": item.get("kind", "item"),
                "aliases": item.get("aliases", []),
                "key_facts": item.get("key_facts", []),
                "owner_character_name": item.get("owner_character_name"),
                "owner_faction_name": item.get("owner_faction_name"),
                "held_by_party": item.get("held_by_party", False),
                "current_location_name": item.get("current_location_name"),
            },
        ))

    if proposals:
        assistant_content = json.dumps({
            "type": "proposals",
            "record_title": record_title,
            "proposals": [p.model_dump() for p in proposals],
            "message_id": message_id,
            "original_text": body.text,
            "usage": llm_usage,
            "raw_llm": llm_result,
        }, ensure_ascii=False)
    else:
        assistant_content = json.dumps({
            "type": "empty",
            "usage": llm_usage,
            "raw_llm": llm_result,
        })

    asst_msg = await client.table("messages").insert({
        "chat_id": body.chat_id,
        "role": "assistant",
        "content": assistant_content,
    }).execute()
    assistant_message_id: str = asst_msg.data[0]["id"]

    return RecordResponse(
        record_title=record_title,
        proposals=proposals,
        message_id=message_id,
        assistant_message_id=assistant_message_id,
        usage=llm_usage,
        raw_llm=llm_result,
    )


# ---------------------------------------------------------------------------
# POST /record/confirm
# ---------------------------------------------------------------------------

class ConfirmRequest(BaseModel):
    accepted_proposals: list[Proposal]
    world_id: str
    campaign_id: str
    chat_id: str
    message_id: str
    assistant_message_id: str | None = None
    original_text: str


class ConfirmResponse(BaseModel):
    created_count: int


@router.post("/record/confirm", response_model=ConfirmResponse)
async def confirm(body: ConfirmRequest, user_id: str = Depends(get_user_id)):
    client = await create_async_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    # Verify world ownership
    world = await client.table("worlds").select("id").eq("id", body.world_id).eq("user_id", user_id).maybe_single().execute()
    if not world.data:
        raise HTTPException(status_code=403, detail="World not found or access denied")

    # Load existing entities for name→id resolution
    existing = await get_world_entities_by_name(client, body.world_id)
    created_by_name: dict[str, str] = {}  # lowercase name → new id

    def resolve(name: str | None) -> str | None:
        if not name:
            return None
        key = name.strip().lower()
        if key in created_by_name:
            return created_by_name[key]
        ref = existing.get(key)
        return ref.id if ref else None

    now = datetime.now(timezone.utc).isoformat()
    created_count = 0

    def _proposals_of(entity_type: str) -> list[Proposal]:
        return [p for p in body.accepted_proposals if p.type == entity_type]

    # -----------------------------------------------------------------------
    # 1. Locations
    # -----------------------------------------------------------------------
    for p in _proposals_of("location"):
        row = {
            "world_id": body.world_id,
            "name": p.name,
            "description": p.description,
            "status": p.status,
            "level": p.data.get("level"),
            "subtype": p.data.get("subtype"),
            "terrain_type": p.data.get("terrain_type"),
            "parent_location_id": resolve(p.data.get("parent_location_name")),
            "updated_at": now,
        }
        if p.action == "create":
            resp = await client.table("locations").insert(row).execute()
            new_id: str = resp.data[0]["id"]
            created_by_name[p.name.strip().lower()] = new_id
            created_count += 1
        else:
            row.pop("world_id")
            await client.table("locations").update(row).eq("id", p.entity_id).execute()

    # -----------------------------------------------------------------------
    # 2. Factions (resolve HQ location)
    # -----------------------------------------------------------------------
    for p in _proposals_of("faction"):
        row = {
            "world_id": body.world_id,
            "name": p.name,
            "description": p.description,
            "status": p.status,
            "kind": p.data.get("kind"),
            "scale": p.data.get("scale"),
            "goals": p.data.get("goals", []),
            "headquarters_location_id": resolve(p.data.get("headquarters_location_name")),
            "updated_at": now,
        }
        if p.action == "create":
            resp = await client.table("factions").insert(row).execute()
            new_id = resp.data[0]["id"]
            created_by_name[p.name.strip().lower()] = new_id
            created_count += 1
        else:
            row.pop("world_id")
            await client.table("factions").update(row).eq("id", p.entity_id).execute()

    # -----------------------------------------------------------------------
    # 3. Characters (resolve location refs)
    # -----------------------------------------------------------------------
    for p in _proposals_of("character"):
        row = {
            "world_id": body.world_id,
            "name": p.name,
            "description": p.description,
            "status": p.status or "unknown",
            "titles": p.data.get("titles", []),
            "aliases": p.data.get("aliases", []),
            "role": p.data.get("role", "npc"),
            "species": p.data.get("species", "unknown"),
            "npc_kind": p.data.get("npc_kind"),
            "key_facts": p.data.get("key_facts", []),
            "current_location_id": resolve(p.data.get("current_location_name")),
            "origin_location_id": resolve(p.data.get("origin_location_name")),
            "updated_at": now,
        }
        if p.action == "create":
            resp = await client.table("characters").insert(row).execute()
            new_id = resp.data[0]["id"]
            created_by_name[p.name.strip().lower()] = new_id
            created_count += 1
        else:
            row.pop("world_id")
            await client.table("characters").update(row).eq("id", p.entity_id).execute()

    # -----------------------------------------------------------------------
    # 4. Items (resolve owner/location refs)
    # -----------------------------------------------------------------------
    for p in _proposals_of("item"):
        row = {
            "world_id": body.world_id,
            "name": p.name,
            "description": p.description,
            "status": p.status,
            "kind": p.data.get("kind", "item"),
            "aliases": p.data.get("aliases", []),
            "key_facts": p.data.get("key_facts", []),
            "held_by_party": p.data.get("held_by_party", False),
            "owner_character_id": resolve(p.data.get("owner_character_name")),
            "owner_faction_id": resolve(p.data.get("owner_faction_name")),
            "current_location_id": resolve(p.data.get("current_location_name")),
            "updated_at": now,
        }
        if p.action == "create":
            resp = await client.table("items").insert(row).execute()
            new_id = resp.data[0]["id"]
            created_by_name[p.name.strip().lower()] = new_id
            created_count += 1
        else:
            row.pop("world_id")
            await client.table("items").update(row).eq("id", p.entity_id).execute()

    # -----------------------------------------------------------------------
    # 5. entity_relations
    # -----------------------------------------------------------------------
    relations_to_insert: list[dict] = []

    for p in body.accepted_proposals:
        source_char_id = created_by_name.get(p.name.strip().lower()) if p.type == "character" else None
        if p.action == "update" and p.type == "character":
            source_char_id = p.entity_id
        source_faction_id = created_by_name.get(p.name.strip().lower()) if p.type == "faction" else None
        if p.action == "update" and p.type == "faction":
            source_faction_id = p.entity_id

        if p.type == "character":
            char_id = source_char_id or resolve(p.name)
            for faction_name in p.data.get("affiliation_faction_names", []):
                faction_id = resolve(faction_name)
                if char_id and faction_id:
                    relations_to_insert.append({
                        "world_id": body.world_id,
                        "source_character_id": char_id,
                        "target_faction_id": faction_id,
                        "kind": "member_of",
                    })

        if p.type == "faction":
            f_id = source_faction_id or resolve(p.name)
            for leader_name in p.data.get("leader_character_names", []):
                char_id = resolve(leader_name)
                if char_id and f_id:
                    relations_to_insert.append({
                        "world_id": body.world_id,
                        "source_character_id": char_id,
                        "target_faction_id": f_id,
                        "kind": "leads",
                    })
            for rel in p.data.get("relations", []):
                target_name = rel.get("target_name", "")
                kind = rel.get("kind", "neutral")
                target_kind = rel.get("target_kind", "faction")
                target_id = resolve(target_name)
                if f_id and target_id:
                    row = {
                        "world_id": body.world_id,
                        "source_faction_id": f_id,
                        "kind": kind,
                        "note": rel.get("note"),
                    }
                    if target_kind == "character":
                        row["target_character_id"] = target_id
                    else:
                        row["target_faction_id"] = target_id
                    relations_to_insert.append(row)

    if relations_to_insert:
        await client.table("entity_relations").insert(relations_to_insert).execute()

    # -----------------------------------------------------------------------
    # 6. Source
    # -----------------------------------------------------------------------
    if body.accepted_proposals and body.message_id:
        await client.table("sources").insert({
            "world_id": body.world_id,
            "campaign_id": body.campaign_id,
            "chat_id": body.chat_id,
            "message_id": body.message_id,
            "kind": "misc",
            "content": body.original_text,
            "visibility": "public",
        }).execute()

    # Update assistant message to confirmed state
    if body.assistant_message_id:
        existing_msg = await client.table("messages").select("content").eq("id", body.assistant_message_id).maybe_single().execute()
        existing_data: dict = {}
        if existing_msg.data:
            try:
                existing_data = json.loads(existing_msg.data["content"])
            except Exception:
                pass
        confirmed_content = json.dumps({
            "type": "confirmed",
            "actions": [p.model_dump() for p in body.accepted_proposals],
            "usage": existing_data.get("usage"),
            "raw_llm": existing_data.get("raw_llm"),
        }, ensure_ascii=False)
        await client.table("messages").update({"content": confirmed_content}).eq("id", body.assistant_message_id).execute()

    return ConfirmResponse(created_count=created_count)
