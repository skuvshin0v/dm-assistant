-- Iteration 1: initial schema

CREATE TABLE worlds (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE campaigns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE chats (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  title       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id    uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user', 'assistant')),
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE entities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('character', 'location', 'faction', 'item')),
  name        text NOT NULL,
  description text,
  status      text,
  visibility  text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'gm_only')),
  data        jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  number      integer NOT NULL,
  kind        text NOT NULL DEFAULT 'main'
                CHECK (kind IN ('main','backstory','flashback','parallel','oneshot')),
  title       text,
  played_at   date,
  summary     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id),
  chat_id     uuid REFERENCES chats(id),
  message_id  uuid REFERENCES messages(id),
  session_id  uuid REFERENCES sessions(id),
  kind        text NOT NULL DEFAULT 'misc'
                CHECK (kind IN ('session_summary','npc_notes','location_notes','lore','misc')),
  content     text NOT NULL,
  visibility  text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'gm_only')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ideas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id           uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  content           text NOT NULL,
  source_message_id uuid REFERENCES messages(id),
  status            text NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new','saved','used','discarded')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- RLS

ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON worlds USING (user_id = auth.uid());
CREATE POLICY "owner_insert" ON worlds FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON campaigns USING (
  EXISTS (SELECT 1 FROM worlds WHERE id = campaigns.world_id AND user_id = auth.uid())
);
CREATE POLICY "owner_insert" ON campaigns FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM worlds WHERE id = campaigns.world_id AND user_id = auth.uid())
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON chats USING (
  EXISTS (SELECT 1 FROM worlds WHERE id = chats.world_id AND user_id = auth.uid())
);
CREATE POLICY "owner_insert" ON chats FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM worlds WHERE id = chats.world_id AND user_id = auth.uid())
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON messages USING (
  EXISTS (
    SELECT 1 FROM chats c
    JOIN worlds w ON w.id = c.world_id
    WHERE c.id = messages.chat_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "owner_insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chats c
    JOIN worlds w ON w.id = c.world_id
    WHERE c.id = messages.chat_id AND w.user_id = auth.uid()
  )
);

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON entities USING (
  EXISTS (SELECT 1 FROM worlds WHERE id = entities.world_id AND user_id = auth.uid())
);
CREATE POLICY "owner_insert" ON entities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM worlds WHERE id = entities.world_id AND user_id = auth.uid())
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON sessions USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN worlds w ON w.id = c.world_id
    WHERE c.id = sessions.campaign_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "owner_insert" ON sessions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns c
    JOIN worlds w ON w.id = c.world_id
    WHERE c.id = sessions.campaign_id AND w.user_id = auth.uid()
  )
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON sources USING (
  EXISTS (SELECT 1 FROM worlds WHERE id = sources.world_id AND user_id = auth.uid())
);
CREATE POLICY "owner_insert" ON sources FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM worlds WHERE id = sources.world_id AND user_id = auth.uid())
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner" ON ideas USING (
  EXISTS (
    SELECT 1 FROM chats c
    JOIN worlds w ON w.id = c.world_id
    WHERE c.id = ideas.chat_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "owner_insert" ON ideas FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chats c
    JOIN worlds w ON w.id = c.world_id
    WHERE c.id = ideas.chat_id AND w.user_id = auth.uid()
  )
);
