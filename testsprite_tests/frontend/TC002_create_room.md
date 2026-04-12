---
id: TC002
slug: create_room
title: Host Creates A Room From A Generated Trivia Set
status: drafted_not_executed
priority: High
source_plan_cases:
  - TC008
  - TC015
source_artifacts:
  - testsprite_tests/standard_prd.json
  - testsprite_tests/frontend_test_plan.json
  - testsprite_tests/testsprite_frontend_test_plan.json
  - testsprite_tests/code_summary.yaml
routes:
  - /create
  - /host/:roomCode
api_calls:
  - POST /api/quizzes/groq-generate
  - POST /api/rooms/create
code_refs:
  - client/src/pages/CreatePage.tsx
  - client/src/pages/HostRoomPage.tsx
  - client/src/components/Lobby.tsx
---

# TC002 Create Room

## Goal
Verify that a host can move from generated trivia review into room creation and arrive at the host lobby with a visible room code.

## Preconditions
- Frontend is already running at `http://127.0.0.1:5173`.
- Backend is already running at `http://127.0.0.1:4000`.
- Trivia generation is available on the create page.

## Suggested Test Data
- Quiz title: `Friday Night Trivia`
- Host name: `Alex`
- Topic: `Science`
- Question count: `10`
- Host role: `Play as host`

## Steps
1. Open `http://127.0.0.1:5173/create`.
2. Fill the `Quiz title` field with `Friday Night Trivia`.
3. Fill the `Host name` field with `Alex`.
4. Leave the default host role as `Play as host`.
5. Keep `Trivia` mode selected.
6. Choose a preset topic such as `Science`.
7. Select `10` questions.
8. Click `Generate Questions`.
9. After the review panel appears, click `Create Room`.
10. Wait for the room-ready panel to appear.
11. Capture the generated room code.
12. Click `Go to lobby`.

## Expected Results
- The room is created without a visible error.
- A `Room created` state appears before navigation.
- A room code is displayed in the room-ready panel.
- Navigating to the lobby lands on `/host/{ROOM_CODE}`.
- The host lobby shows the room code, copy/share controls, and the players section.

## Notes For Later Execution
- `CreatePage` only enables room creation after questions exist and both `Quiz title` and `Host name` are filled.
- This case is intentionally trivia-based even though the generated plan also includes a custom-mode room-creation case.
- Save the room code from this case for `TC003_join_via_code` and `TC004_play_again`.
