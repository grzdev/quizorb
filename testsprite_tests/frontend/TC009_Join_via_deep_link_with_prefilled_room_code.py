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
        context.set_default_timeout(8000)

        host_page = await context.new_page()
        await host_page.goto(APP_URL, wait_until="domcontentloaded")

        # Create a real room first so the deep link targets a valid active game.
        await host_page.get_by_role("link", name="Create Game").first.click()
        await host_page.get_by_role("button", name=re.compile("Custom")).click()

        await host_page.get_by_label("Question prompt").fill("2+2?")
        await host_page.get_by_label("Option A").fill("4")
        await host_page.get_by_label("Option B").fill("3")
        await host_page.get_by_label("Option C").fill("5")
        await host_page.get_by_label("Option D").fill("6")
        await host_page.get_by_role("button", name=re.compile(r"Add Question")).click()

        await host_page.get_by_label("Quiz title").fill("Deep Link Join Test")
        await host_page.get_by_label("Host name").fill("HostPlayer")
        await host_page.get_by_role("button", name="Create Room").click()

        room_code_locator = host_page.locator(".room-code-value")
        await expect(room_code_locator).to_be_visible()
        room_code = (await room_code_locator.text_content() or "").strip().upper()
        assert re.fullmatch(r"[A-Z2-9]{6}", room_code), f"Expected a generated room code, got {room_code!r}"

        # Open the real deep link and verify the room code is prefilled.
        player_page = await context.new_page()
        await player_page.goto(f"{APP_URL}/join?code={room_code}", wait_until="domcontentloaded")

        room_code_input = player_page.get_by_label("Room code")
        await expect(room_code_input).to_have_value(room_code)

        player_name_input = player_page.get_by_label("Your name")
        await player_name_input.fill("PLAYER01")
        await player_page.get_by_role("button", name="Join Game").click()

        await expect(player_page).to_have_url(re.compile(rf"{re.escape(APP_URL)}/play/{re.escape(room_code)}$"))
        await expect(player_page.locator("body")).to_contain_text(room_code)
        await expect(player_page.locator("body")).to_contain_text("PLAYER01")

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
