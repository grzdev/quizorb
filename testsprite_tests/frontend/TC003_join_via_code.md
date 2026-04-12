---
id: TC003
slug: join_via_code
title: Player Joins Through A Prefilled Code Link
status: drafted_not_executed
priority: High
source_plan_cases:
  - TC009
  - TC024
source_artifacts:
  - testsprite_tests/standard_prd.json
  - testsprite_tests/frontend_test_plan.json
  - testsprite_tests/testsprite_frontend_test_plan.json
  - testsprite_tests/code_summary.yaml
routes:
  - /join
  - /join?code={ROOM_CODE}
  - /play/:roomCode
socket_events:
  - room:join
code_refs:
  - client/src/pages/JoinPage.tsx
  - client/src/pages/PlayRoomPage.tsx
  - client/src/utils/share.ts
  - client/src/App.tsx
---

# TC003 Join Via Code

## Goal
Verify that a player can join through a real deep link by first creating a live room, then opening `?code=` with that generated room code and reaching the player room flow.

## Preconditions
- Frontend is already running at `http://127.0.0.1:5173`.
- Backend is already running at `http://127.0.0.1:4000`.

## Suggested Test Data
- Room code: generated during this test run
- Deep link: `http://127.0.0.1:5173/join?code={ROOM_CODE}`
- Player name: `PLAYER01`

## Steps
1. Open the create flow and create a real room.
2. Capture the generated `ROOM_CODE` from the room-created view.
3. Open `http://127.0.0.1:5173/join?code={ROOM_CODE}` directly in a fresh browser tab or session.
4. Verify the `Room code` field is already populated from the query string.
5. Confirm the prefilled value is uppercase and matches the created room code exactly.
6. Fill the `Your name` field with `PLAYER01`.
7. Click `Join Game`.
8. Wait for the route transition after the socket join callback resolves.

## Expected Results
- The test creates a valid active room before attempting the deep-link join flow.
- The join form loads without an inline error.
- The room code field is prefilled from the `?code=` query parameter.
- Submitting the form emits the join request against the live created room and does not require retyping the room code.
- The app navigates to `/play/{ROOM_CODE}` on success.
- The player sees the player room experience, usually the lobby/waiting state if the host has not started the game yet.

## Notes For Later Execution
- `JoinPage` initializes `roomCode` from `searchParams.get('code')`.
- `share.ts` builds the same deep-link pattern used in the host lobby share controls.
- This case intentionally avoids fake hardcoded room codes like `ROOM01`.
- A companion variation already exists in the TestSprite plan for editing a prefilled code before submit.
