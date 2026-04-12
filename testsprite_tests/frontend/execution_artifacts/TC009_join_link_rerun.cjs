const assert = require("node:assert/strict");
const { chromium } = require("C:/Users/raiden/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright");

const APP_URL = "http://localhost:5173";
const ARTIFACT_DIR = "C:/Users/raiden/quizdrop/testsprite_tests/execution_artifacts";

async function textContent(locator) {
  return ((await locator.textContent()) || "").trim();
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  context.setDefaultTimeout(12000);

  const hostPage = await context.newPage();
  try {
    await hostPage.goto(APP_URL, { waitUntil: "domcontentloaded" });
    await hostPage.getByRole("link", { name: "Create Game" }).first().click();
    await hostPage.getByRole("button", { name: /Custom/i }).click();

    await hostPage.getByLabel("Question prompt").fill("2+2?");
    await hostPage.getByLabel("Option A").fill("4");
    await hostPage.getByLabel("Option B").fill("3");
    await hostPage.getByLabel("Option C").fill("5");
    await hostPage.getByLabel("Option D").fill("6");
    await hostPage.getByRole("button", { name: /Add Question/i }).click();

    await hostPage.getByLabel("Quiz title").fill("Deep Link Join Test");
    await hostPage.getByLabel("Host name").fill("HostPlayer");
    await hostPage.getByRole("button", { name: "Create Room" }).click();

    const roomCodeLocator = hostPage.locator(".room-code-value");
    await roomCodeLocator.waitFor({ state: "visible" });
    const roomCode = (await textContent(roomCodeLocator)).toUpperCase();
    assert.match(roomCode, /^[A-Z2-9]{6}$/);

    const playerPage = await context.newPage();
    await playerPage.goto(`${APP_URL}/join?code=${roomCode}`, { waitUntil: "domcontentloaded" });

    const roomCodeInput = playerPage.getByLabel("Room code");
    await roomCodeInput.waitFor({ state: "visible" });
    assert.equal(await roomCodeInput.inputValue(), roomCode);

    await playerPage.getByLabel("Your name").fill("PLAYER01");
    await playerPage.getByRole("button", { name: "Join Game" }).click();

    await playerPage.waitForURL(new RegExp(`${APP_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/play/${roomCode}$`));
    await playerPage.getByText("Waiting for the host to start the game…").waitFor({ state: "visible", timeout: 15000 });
    const bodyText = await playerPage.locator("body").innerText();
    assert.match(bodyText, new RegExp(roomCode));
    assert.doesNotMatch(bodyText, /Join Game\s+Enter the room code to jump straight in/i);

    await playerPage.screenshot({ path: `${ARTIFACT_DIR}/TC009_join_success.png`, fullPage: true });
    console.log(JSON.stringify({
      status: "PASSED",
      roomCode,
      finalUrl: playerPage.url(),
      evidence: [
        "TC009_join_success.png",
      ],
    }));
  } catch (error) {
    await hostPage.screenshot({ path: `${ARTIFACT_DIR}/TC009_failed_host.png`, fullPage: true }).catch(() => {});
    const openPages = context.pages();
    const playerPage = openPages[openPages.length - 1];
    await playerPage.screenshot({ path: `${ARTIFACT_DIR}/TC009_failed_player.png`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
