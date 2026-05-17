-- Migration 002: replace generic entities table with typed tables + entity_relations

DROP TABLE IF EXISTS entities;

-- -------------------------------------------------------------------------
-- LOCATIONS (created first; FK to factions added after factions exists)
-- -------------------------------------------------------------------------
CREATE TABLE locations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  status      text CHECK (status IN ('destroyed','abandoned','hidden','unknown')),
  visibility  text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','gm_only')),
  level       text CHECK (level IN ('plane','world','continent','region','state','settlement','district','site','building','room')),
  subtype     text,
  terrain_type text,
  parent_location_id       uuid REFERENCES locations(id) ON DELETE SET NULL,
  controlled_by_faction_id uuid,  -- FK added after factions table
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------------
-- FACTIONS (FK to locations added after)
-- -------------------------------------------------------------------------
CREATE TABLE factions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  status      text CHECK (status IN ('active','disbanded','underground','unknown')),
  visibility  text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','gm_only')),
  kind        text CHECK (kind IN ('cult','guild','order','clan','dynasty','family','government','military','religious','criminal','merchant','secret_society','party','other')),
  scale       text CHECK (scale IN ('local','regional','state','world')),
  goals       text[] DEFAULT '{}',
  headquarters_location_id uuid,  -- FK added after locations table
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Cross-FKs between locations and factions
ALTER TABLE locations ADD CONSTRAINT fk_controlled_by_faction
  FOREIGN KEY (controlled_by_faction_id) REFERENCES factions(id) ON DELETE SET NULL;
ALTER TABLE factions ADD CONSTRAINT fk_headquarters_location
  FOREIGN KEY (headquarters_location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- -------------------------------------------------------------------------
-- CHARACTERS
-- -------------------------------------------------------------------------
CREATE TABLE characters (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  status      text DEFAULT 'unknown' CHECK (status IN ('alive','dead','unknown')),
  visibility  text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','gm_only')),
  titles      text[] DEFAULT '{}',
  aliases     text[] DEFAULT '{}',
  role        text NOT NULL DEFAULT 'npc' CHECK (role IN ('player','npc','unknown')),
  species     text DEFAULT 'unknown',
  npc_kind    text CHECK (npc_kind IN ('villain','boss','ally','patron','quest_giver','merchant','authority','commoner','rival','deity','other')),
  key_facts   text[] DEFAULT '{}',
  current_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  origin_location_id  uuid REFERENCES locations(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------------
-- ITEMS
-- -------------------------------------------------------------------------
CREATE TABLE items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  status      text CHECK (status IN ('active','lost','destroyed','hidden','unknown')),
  visibility  text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','gm_only')),
  kind        text NOT NULL DEFAULT 'item' CHECK (kind IN ('artifact','item')),
  aliases     text[] DEFAULT '{}',
  key_facts   text[] DEFAULT '{}',
  held_by_party       boolean NOT NULL DEFAULT false,
  owner_character_id  uuid REFERENCES characters(id) ON DELETE SET NULL,
  owner_faction_id    uuid REFERENCES factions(id) ON DELETE SET NULL,
  current_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------------
-- ENTITY_RELATIONS
-- Single table covering: membership (member_of), leadership (leads),
-- inter-faction relations (allied/hostile/etc.), service (serves)
-- -------------------------------------------------------------------------
CREATE TABLE entity_relations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  source_character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
  source_faction_id   uuid REFERENCES factions(id) ON DELETE CASCADE,
  target_character_id uuid REFERENCES characters(id) ON DELETE CASCADE,
  target_faction_id   uuid REFERENCES factions(id) ON DELETE CASCADE,
  target_location_id  uuid REFERENCES locations(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN (
    'member_of','leads','allied','hostile','vassal','rival','neutral','serves','patron'
  )),
  note text,
  -- exactly one source
  CONSTRAINT chk_one_source CHECK (
    (source_character_id IS NOT NULL)::int + (source_faction_id IS NOT NULL)::int = 1
  ),
  -- exactly one target
  CONSTRAINT chk_one_target CHECK (
    (target_character_id IS NOT NULL)::int + (target_faction_id IS NOT NULL)::int +
    (target_location_id IS NOT NULL)::int = 1
  )
);

-- -------------------------------------------------------------------------
-- RLS
-- -------------------------------------------------------------------------
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON locations
  FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = locations.world_id AND user_id = auth.uid()));
CREATE POLICY "owner_insert" ON locations
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM worlds WHERE id = locations.world_id AND user_id = auth.uid()));

ALTER TABLE factions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON factions
  FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = factions.world_id AND user_id = auth.uid()));
CREATE POLICY "owner_insert" ON factions
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM worlds WHERE id = factions.world_id AND user_id = auth.uid()));

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON characters
  FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = characters.world_id AND user_id = auth.uid()));
CREATE POLICY "owner_insert" ON characters
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM worlds WHERE id = characters.world_id AND user_id = auth.uid()));

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON items
  FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = items.world_id AND user_id = auth.uid()));
CREATE POLICY "owner_insert" ON items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM worlds WHERE id = items.world_id AND user_id = auth.uid()));

ALTER TABLE entity_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON entity_relations
  FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = entity_relations.world_id AND user_id = auth.uid()));
CREATE POLICY "owner_insert" ON entity_relations
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM worlds WHERE id = entity_relations.world_id AND user_id = auth.uid()));
