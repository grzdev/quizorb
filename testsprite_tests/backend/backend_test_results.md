# Backend API Smoke Test Results

Executed locally against:
- `http://localhost:4000`

Result:
- `4/4` checks passed

Validated endpoints:
- `POST /api/quizzes/groq-generate` accepts a valid payload with `topic`, `count`, and `difficulty`
- `POST /api/quizzes/groq-generate` rejects a missing `topic`
- `GET /api/rooms/:code` returns an existing room
- `GET /api/rooms/:code` returns `404` for an invalid room code

Executed script:
- `testsprite_tests/backend/backend_api_smoke.mjs`
