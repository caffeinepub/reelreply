# Specification

## Summary
**Goal:** Build ReelReply: an authenticated dashboard for configuring keyword-based Instagram comment auto-replies, backed by a single Motoko canister that receives Instagram webhooks, replies via the official Graph API, and provides logs with rate limiting and idempotency.

**Planned changes:**
- Add Internet Identity authentication and create a per-user profile keyed by Principal; restrict dashboard/settings/logs access to authenticated users.
- Build a React dark-theme SaaS dashboard with sections for Instagram Connection, Automation Settings (keyword, reply message, ON/OFF), and Logs; ensure all UI copy is in English and uses a warm (non-blue/purple) accent.
- Implement per-user storage and APIs for Instagram integration credentials (IDs + access token) and automation configuration; validate credentials via a test Instagram Graph API call.
- Add a Motoko HTTP webhook endpoint supporting Instagram verification handshake and incoming event validation/signature checks; normalize events and map them to the correct user configuration.
- Process comment events: keyword match + enabled check, then post replies via Instagram’s official Graph API endpoint; capture outcomes and errors.
- Add per-user rate limiting/burst protection for outgoing replies plus idempotency to prevent duplicate replies for the same comment/event.
- Persist per-user reply logs and expose a paginated, newest-first query; show a logs table with basic outcome filtering and an empty state.
- Add compliance-oriented UX: a short notice about permissions/review/webhook verification, a “Test Mode” indicator when credentials aren’t validated, and avoid storing unnecessary personal data.
- Include generated static brand assets (logo + logs empty state illustration) under `frontend/public/assets/generated` and reference them in the dashboard.

**User-visible outcome:** Users can sign in with Internet Identity, configure and validate Instagram Graph API credentials (Business/Creator only), set a keyword + auto-reply with an enable toggle, and view/filter a log of reply attempts; the backend safely handles webhook bursts with rate limiting and avoids duplicate replies.
