import re
from playwright import async_api
from playwright.async_api import expect


APP_URL = "http://127.0.0.1:5173"


async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process",
            ],
        )

        context = await browser.new_context()
        context.set_default_timeout(12000)

        page = await context.new_page()
        await page.goto(APP_URL, wait_until="domcontentloaded")

        # Create a minimal one-question room as a playing host.
        await page.get_by_role("link", name="Create Game").first.click()
        await page.get_by_role("button", name=re.compile("Custom")).click()

        await page.get_by_label("Question prompt").fill("2+2?")
        await page.get_by_label("Option A").fill("4")
        await page.get_by_label("Option B").fill("3")
        await page.get_by_label("Option C").fill("5")
        await page.get_by_label("Option D").fill("6")
        await page.get_by_role("button", name=re.compile(r"Add Question")).click()

        await page.get_by_label("Quiz title").fill("Play Again Regression")
        await page.get_by_label("Host name").fill("HostPlayer")
        await page.get_by_role("button", name="Create Room").click()

        room_code_locator = page.locator(".room-code-value")
        await expect(room_code_locator).to_be_visible()
        room_code = (await room_code_locator.text_content() or "").strip().upper()
        assert re.fullmatch(r"[A-Z2-9]{6}", room_code), f"Expected a generated room code, got {room_code!r}"

        await page.get_by_role("button", name=re.compile(r"Go to lobby")).click()
        await expect(page).to_have_url(re.compile(rf"{re.escape(APP_URL)}/host/{re.escape(room_code)}$"))

        start_button = page.get_by_role("button", name="Start game")
        await expect(start_button).to_be_visible()
        await start_button.click()

        await page.get_by_role("button", name="4").click()
        await expect(page.locator("body")).to_contain_text("Game Over")

        play_again_button = page.get_by_role("button", name="Play Again")
        await expect(play_again_button).to_be_visible()
        await play_again_button.click()

        await expect(page).to_have_url(re.compile(rf"{re.escape(APP_URL)}/host/{re.escape(room_code)}$"))
        await expect(page.locator("body")).to_contain_text(room_code)
        await expect(start_button).to_be_visible()
        await expect(page.locator("body")).not_to_contain_text("Game Over")

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


if __name__ == "__main__":
    import asyncio

    asyncio.run(run_test())
