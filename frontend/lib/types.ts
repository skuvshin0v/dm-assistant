export type World = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  world_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Chat = {
  id: string;
  world_id: string;
  campaign_id: string | null;
  title: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type EntityType = "character" | "location" | "faction" | "item";

export type Visibility = "public" | "gm_only";

export type Character = {
  id: string;
  world_id: string;
  name: string;
  description: string | null;
  status: string | null;
  visibility: Visibility;
  titles: string[];
  aliases: string[];
  role: string;
  species: string;
  npc_kind: string | null;
  key_facts: string[];
  current_location_id: string | null;
  origin_location_id: string | null;
  created_at: string;
};

export type Location = {
  id: string;
  world_id: string;
  name: string;
  description: string | null;
  status: string | null;
  visibility: Visibility;
  level: string | null;
  subtype: string | null;
  terrain_type: string | null;
  parent_location_id: string | null;
  controlled_by_faction_id: string | null;
  created_at: string;
};

export type Faction = {
  id: string;
  world_id: string;
  name: string;
  description: string | null;
  status: string | null;
  visibility: Visibility;
  kind: string | null;
  scale: string | null;
  goals: string[];
  headquarters_location_id: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  world_id: string;
  name: string;
  description: string | null;
  status: string | null;
  visibility: Visibility;
  kind: string;
  aliases: string[];
  key_facts: string[];
  held_by_party: boolean;
  owner_character_id: string | null;
  owner_faction_id: string | null;
  current_location_id: string | null;
  created_at: string;
};

export type Proposal = {
  action: "create" | "update";
  type: EntityType;
  entity_id: string | null;
  name: string;
  description: string | null;
  status: string | null;
  data: Record<string, unknown>;
};
