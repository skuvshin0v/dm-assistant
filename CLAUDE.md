# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**dm-assistant** — AI-powered web assistant for Dungeons & Dragons Dungeon Masters. Core value: world context storage, semantic search within world data, brainstorming and idea generation for session prep, and additional DM tools. Monetized via subscriptions.

## Tech Stack

| Layer      | Technology                                 |
| ---------- | ------------------------------------------ |
| Frontend   | Next.js (App Router, TypeScript)           |
| AI backend | Python + FastAPI                           |
| Auth + DB  | Supabase (Postgres + Auth + Storage)       |
| AI models  | Anthropic Claude API                       |
| Payments   | TBD (product is for CIS/Russian community) |

## Architecture

Two services:

1. **`/frontend`** — Next.js app. Handles UI, routing, and lightweight API routes (auth callbacks, Stripe webhooks). Communicates with the AI backend via internal HTTP.
2. **`/backend`** — Python FastAPI service. All AI logic lives here: prompt construction, Claude API calls, vector search, context management.

Supabase is the source of truth for user data, world content, and auth tokens. The frontend reads/writes Supabase directly for non-AI operations (CRUD on world entities). The backend reads Supabase to fetch context when building prompts.

## Development Commands

### Frontend (`/frontend`)

```bash
npm install          # install dependencies
npm run dev          # start dev server at localhost:3000
npm run build        # production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

### Backend (`/backend`)

```bash
python -m venv .venv && source .venv/bin/activate  # create and activate virtualenv
pip install -r requirements.txt                     # install dependencies
uvicorn main:app --reload --port 8000               # start dev server at localhost:8000
pytest                                              # run all tests
pytest tests/test_foo.py                            # run a single test file
```

## Environment Variables

### Frontend (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`.env`)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
LLM_PROVIDER=openai_compatible
LLM_API_KEY=
LLM_BASE_URL=https://polza.ai/api/v1
LLM_MODEL=google/gemini-3.1-flash-lite
```

## Key Domain Concepts

- **Campaign** — a user's D&D world/story. One user can have multiple campaigns.
- **World entity** — any named element in a campaign: NPC, location, faction, item, lore entry.
- **Session** — a single play session within a campaign; has notes and a summary.
- **Context window** — assembled set of relevant world entities injected into Claude prompts.

## AI Backend Patterns

- Use Anthropic SDK with prompt caching (`cache_control`) on large world-context blocks — campaigns can be large and caching reduces cost significantly.
- Vector embeddings for world entities enable semantic search ("find all NPCs related to the thieves guild").
- Each API endpoint receives a `campaign_id`; the backend fetches relevant entities from Supabase to build the context.

## Supabase Notes

- Row-Level Security (RLS) must be enabled on all tables. Users must only access their own campaigns.
- Use Supabase Auth on the frontend; pass the JWT to the FastAPI backend in the `Authorization` header. The backend validates the JWT using the Supabase JWT secret.

## Skills

При продуктовых решениях: read .claude/skills/product-thinking.md
Для любого UI: read .claude/skills/frontend-design.md
