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

export type Proposal = {
  action: "create" | "update";
  type: EntityType;
  entity_id: string | null;
  name: string;
  description: string | null;
  status: string | null;
  data: Record<string, unknown>;
};
