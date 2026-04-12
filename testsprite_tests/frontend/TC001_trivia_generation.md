---
id: TC001
slug: trivia_generation
title: Preset Trivia Generation Reaches Review
status: drafted_not_executed
priority: High
source_plan_cases:
  - TC011
source_artifacts:
  - testsprite_tests/standard_prd.json
  - testsprite_tests/frontend_test_plan.json
  - testsprite_tests/testsprite_frontend_test_plan.json
  - testsprite_tests/code_summary.yaml
routes:
  - /create
api_calls:
  - POST /api/quizzes/groq-generate
code_refs:
  - client/src/pages/CreatePage.tsx
---

# TC001 Trivia Generation

## Goal
Verify that a host can generate a trivia set from a preset topic and reach the review state on the create flow.

## Preconditions
- Frontend is already running at `http://127.0.0.1:5173`.
- Backend is already running at `http://127.0.0.1:4000`.
- No rebuild, restart, or test execution is required.

## Suggested Test Data
- Quiz title: `Friday Night Trivia`
- Host name: `Alex`
- Topic: `Science`
- Question count: `10`

## Steps
1. Open `http://127.0.0.1:5173/create`.
2. Confirm the `Trivia` mode is active.
3. Fill the `Quiz title` field with `Friday Night Trivia`.
4. Fill the `Host name` field with `Alex`.
5. In the preset topic source, choose the `Science` topic chip.
6. Select the `10` question count option.
7. Click `Generate Questions`.
8. Wait for the create page to leave the empty state and render the generated review panel.

## Expected Results
- The request completes without a visible error message.
- The review area shows generated quiz content instead of the empty placeholder.
- At least one generated question is visible in the review list, or the host summary card is shown if host-play mode hides full answers.
- The `Create Room` button becomes available after generation.
- No room code is shown yet because room creation has not started.

## Notes For Later Execution
- `CreatePage` calls `POST /api/quizzes/groq-generate` for preset-topic trivia generation.
- The happy path is rooted in the `Trivia generation from preset topics` feature from the TestSprite PRD and plan.
