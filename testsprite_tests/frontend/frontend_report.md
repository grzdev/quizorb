# Frontend Rerun Report

Date: 2026-04-13

This pass re-ran only the two previously failing frontend flows:
- `TC001` Host triggers Play Again and returns to lobby for a new run
- `TC009` Join via deep link with prefilled room code

## Result

Both reruns passed.

## Environment Notes

- Requested app endpoints:
  - Frontend: `http://127.0.0.1:5173`
  - Backend: `http://127.0.0.1:4000`
- Executed frontend URL: `http://localhost:5173`
- Reason: the running frontend is configured to call `http://localhost:4000`, and the current backend CORS allowlist accepts `localhost` rather than `127.0.0.1:5173`. Using `localhost:5173` exercised the same running dev server without rebuilding or restarting anything.
- No rebuild or restart was performed.

## Flow Outcomes

### TC001 Play Again returns host to lobby

Status: `PASSED`

What was verified:
- A room was created and the generated room code was captured.
- The host started and completed a minimal one-question game.
- Clicking `Play Again` kept the host on the same `/host/{ROOM_CODE}` route.
- The same room code was preserved.
- The host lobby returned immediately with `Start game` visible again.

Artifacts:
- Log: [TC001_play_again_rerun.log](C:/Users/raiden/quizdrop/testsprite_tests/execution_artifacts/TC001_play_again_rerun.log)
- Before reset screenshot: [TC001_before_play_again.png](C:/Users/raiden/quizdrop/testsprite_tests/execution_artifacts/TC001_before_play_again.png)
- After reset screenshot: [TC001_after_play_again.png](C:/Users/raiden/quizdrop/testsprite_tests/execution_artifacts/TC001_after_play_again.png)

### TC009 Join via deep link with prefilled room code

Status: `PASSED`

What was verified:
- A real room was created first.
- Opening `/join?code={ROOM_CODE}` prefilled the room code input.
- The player entered a name and joined successfully.
- The app navigated to `/play/{ROOM_CODE}` and loaded the player room lobby.

Artifacts:
- Log: [TC009_join_link_rerun.log](C:/Users/raiden/quizdrop/testsprite_tests/execution_artifacts/TC009_join_link_rerun.log)
- Success screenshot: [TC009_join_success.png](C:/Users/raiden/quizdrop/testsprite_tests/execution_artifacts/TC009_join_success.png)

## Summary

The two previously failing frontend flows now pass in this local rerun:
- `Play Again` returns the host to the same room lobby.
- `Join via deep link` works with a real generated room code and reaches the player room successfully.
