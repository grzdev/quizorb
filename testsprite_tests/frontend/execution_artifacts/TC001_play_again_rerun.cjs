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
  const page = await context.newPage();

  try {
    await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Create Game" }).first().click();
    await page.getByRole("button", { name: /Custom/i }).click();

    await page.getByLabel("Question prompt").fill("2+2?");
    await page.getByLabel("Option A").fill("4");
    await page.getByLabel("Option B").fill("3");
    await page.getByLabel("Option C").fill("5");
    await page.getByLabel("Option D").fill("6");
    await page.getByRole("button", { name: /Add Question/i }).click();

    await page.getByLabel("Quiz title").fill("Play Again Regression");
    await page.getByLabel("Host name").fill("HostPlayer");
    await page.getByRole("button", { name: "Create Room" }).click();

    const roomCodeLocator = page.locator(".room-code-value");
    await roomCodeLocator.waitFor({ state: "visible" });
    const roomCode = (await textContent(roomCodeLocator)).toUpperCase();
    assert.match(roomCode, /^[A-Z2-9]{6}$/);

    await page.getByRole("button", { name: /Go to lobby/i }).click();
    await page.waitForURL(new RegExp(`${APP_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/host/${roomCode}$`));

    const startButton = page.getByRole("button", { name: "Start game" });
    await startButton.waitFor({ state: "visible" });
    await startButton.click();

    await page.getByRole("button", { name: "4" }).click();
    await page.getByRole("button", { name: "Play Again" }).waitFor({ state: "visible", timeout: 15000 });
    await page.screenshot({ path: `${ARTIFACT_DIR}/TC001_before_play_again.png`, fullPage: true });

    await page.getByRole("button", { name: "Play Again" }).click();
    await startButton.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForURL(new RegExp(`${APP_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/host/${roomCode}$`));

    const bodyText = await page.locator("body").innerText();
    assert.match(bodyText, new RegExp(roomCode));
    assert.doesNotMatch(bodyText, /Game Over/i);

    await page.screenshot({ path: `${ARTIFACT_DIR}/TC001_after_play_again.png`, fullPage: true });
    console.log(JSON.stringify({
      status: "PASSED",
      roomCode,
      finalUrl: page.url(),
      evidence: [
        "TC001_before_play_again.png",
        "TC001_after_play_again.png",
      ],
    }));
  } catch (error) {
    await page.screenshot({ path: `${ARTIFACT_DIR}/TC001_failed.png`, fullPage: true }).catch(() => {});
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
