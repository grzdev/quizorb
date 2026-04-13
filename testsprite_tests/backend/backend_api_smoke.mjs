import assert from "node:assert/strict";

const API_BASE = (process.env.QUIZORB_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const text = await response.text();

  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { response, body };
}

async function createTestRoom() {
  const payload = {
    title: "Backend API Smoke Room",
    questions: [
      {
        text: "What is 2 + 2?",
        options: ["4", "3", "5", "6"],
        correctIndex: 0,
        timeLimit: 20,
      },
    ],
    mode: "custom",
    hostMode: "player",
    quizSource: {
      type: "custom",
      count: 1,
    },
  };

  const { response, body } = await requestJson("/api/rooms/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  assert.equal(response.status, 200, `expected room creation to succeed, got ${response.status}`);
  assert.equal(typeof body?.roomCode, "string", "expected roomCode string from /api/rooms/create");

  return body.roomCode;
}

async function run(name, testFn) {
  try {
    await testFn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  }
}

await run("POST /api/quizzes/groq-generate accepts a valid payload", async () => {
  const { response, body } = await requestJson("/api/quizzes/groq-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: "science",
      count: 5,
      difficulty: "medium",
    }),
  });

  assert.equal(response.status, 200, `expected 200, got ${response.status}`);
  assert.ok(Array.isArray(body?.questions), "expected questions array");
  assert.ok(body.questions.length > 0, "expected at least one generated question");
});

await run("POST /api/quizzes/groq-generate rejects a missing topic", async () => {
  const { response, body } = await requestJson("/api/quizzes/groq-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      count: 5,
      difficulty: "hard",
    }),
  });

  assert.equal(response.status, 400, `expected 400, got ${response.status}`);
  assert.match(String(body?.error ?? ""), /topic/i);
});

await run("GET /api/rooms/:code returns an existing room", async () => {
  const roomCode = await createTestRoom();
  const { response, body } = await requestJson(`/api/rooms/${roomCode}`);

  assert.equal(response.status, 200, `expected 200, got ${response.status}`);
  assert.equal(body?.roomCode, roomCode);
  assert.equal(body?.status, "lobby");
  assert.ok(Array.isArray(body?.players), "expected players array");
});

await run("GET /api/rooms/:code returns 404 for an invalid room", async () => {
  const { response, body } = await requestJson("/api/rooms/NOTREALROOM");

  assert.equal(response.status, 404, `expected 404, got ${response.status}`);
  assert.match(String(body?.error ?? ""), /room not found/i);
});
