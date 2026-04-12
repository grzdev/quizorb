---
id: TC004
slug: play_again
title: Host Resets Finished Game And Returns Everyone To Lobby
status: drafted_not_executed
priority: High
source_plan_cases:
  - TC001
  - TC006
  - TC022
source_artifacts:
  - testsprite_tests/standard_prd.json
  - testsprite_tests/frontend_test_plan.json
  - testsprite_tests/testsprite_frontend_test_plan.json
  - testsprite_tests/code_summary.yaml
routes:
  - /host/:roomCode
  - /play/:roomCode
socket_events:
  - game:start
  - question:started
  - leaderboard:updated
  - game:finished
  - room:reset
  - room:updated
code_refs:
  - client/src/pages/HostRoomPage.tsx
  - client/src/pages/PlayRoomPage.tsx
  - client/src/components/Lobby.tsx
---

# TC004 Play Again

## Goal
Verify that once a game reaches the finished state, the host can trigger `Play Again` and the room returns to lobby state for a new run.

## Preconditions
- Reuse the room created in `TC002_create_room`, or create a new trivia room first.
- Frontend is already running at `http://127.0.0.1:5173`.
- Backend is already running at `http://127.0.0.1:4000`.
- Host is in `/host/{ROOM_CODE}`.
- At least the host is connected as a player, and an additional player is recommended to confirm multi-client reset behavior.

## Suggested Test Data
- Room code: `{ROOM_CODE}`
- Answer strategy: choose any valid answer option before timeout on each question

## Steps
1. Open the host room at `/host/{ROOM_CODE}`.
2. Start the game from the host lobby.
3. For every question in the run, wait for the question screen and submit any valid answer before the timer expires.
4. After each leaderboard screen, continue until the game reaches the finished state.
5. Verify the finished view shows the `Play Again` button.
6. Click `Play Again`.
7. Observe the host screen after the reset event.
8. If a player client is connected, observe its screen after the same reset event.
9. Optionally click `Start game` again from the returned lobby to confirm a fresh run can begin.

## Expected Results
- The game reaches a finished state with leaderboard results visible.
- `Play Again` is available only in the finished state, not during lobby or mid-game screens.
- Clicking `Play Again` removes the finished-state view and returns the host to the lobby for the same room code.
- The question screen is cleared and the room status returns to lobby.
- Connected player clients also return to their lobby state when the host resets the room.
- If the host starts again after reset, a new question is delivered for the next run.

## Notes For Later Execution
- The host reset action is `socket.emit('room:reset', { roomCode })`.
- Both host and player room pages listen for `room:updated` and switch back to `lobby` when `status === 'lobby'`.
- This case combines the reset-to-lobby behavior and the immediate follow-up rerun behavior covered by the generated plan.
