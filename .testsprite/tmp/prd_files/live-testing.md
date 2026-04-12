# QuizOrb TestSprite Hackathon Scope

Project under test:
- Local frontend: http://localhost:5173
- Local backend: http://localhost:4000
- Secondary deployed frontend: https://quizorb.netlify.app
- Secondary deployed backend: https://quizorb.onrender.com

Primary requirement:
- Use TestSprite MCP on the local codebase and local running app from this workspace.
- Generate repo-visible test artifacts for a hackathon submission.

Use TestSprite to validate these local-first flows:
1. Trivia generation
2. Room creation
3. Join via direct link using `?code=`
4. Multiplayer sync
5. Play Again flow
6. File upload flow
7. Error handling for invalid room code and duplicate names

Use the deployed URLs only as secondary verification when useful, not as the main execution path.

Produce artifacts suitable for submission:
- test cases
- test plans
- execution report artifacts

Report:
- TestSprite findings
- Failing flows
- Bugs with reproduction steps
- Suggested improvements
