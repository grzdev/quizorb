# TestSprite Artifacts

This folder contains repo-visible TestSprite hackathon artifacts generated from the local QuizOrb codebase and local app execution.

## Structure

- Root shared files:
  - `README.md`
  - `summary.json`
  - `standard_prd.json`
  - `code_summary.yaml`
- Frontend artifacts:
  - `frontend/`
  - Planning outputs, frontend TC files, execution results, and temporary TestSprite outputs live here.
  - Execution screenshots and helper rerun scripts are under `frontend/execution_artifacts/`.
- Backend artifacts:
  - `backend/`
  - Reserved for backend-specific planning and execution artifacts.
  - Backend execution artifacts belong under `backend/execution_artifacts/`.
- Logs:
  - `logs/`
  - Centralized MCP, app, and local rerun logs.

## Suggested Review Order

1. Start with `standard_prd.json` and `code_summary.yaml`.
2. Review frontend planning and TC materials under `frontend/`.
3. Check `frontend/frontend_report.md` and `frontend/test_results.json` for the latest execution summary.
4. Open `frontend/execution_artifacts/` for screenshots and local rerun helpers.
5. Use `logs/` for MCP and execution logs when deeper inspection is needed.
