import asyncio
import re

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import APP_URL, create_host_lobby, join_room, run_test_case


async def exercise(context: BrowserContext) -> None:
    host_page = await context.new_page()
    room_code = await create_host_lobby(host_page, title="Duplicate Name Guard")

    player_one = await context.new_page()
    await join_room(player_one, room_code, "SAM")
    await expect(host_page.get_by_text("SAM", exact=True)).to_have_count(1)

    player_two = await context.new_page()
    await player_two.goto(f"{APP_URL}/join?code={room_code}", wait_until="domcontentloaded")
    await page_get_ready(player_two)
    await player_two.get_by_label("Your name").fill("SAM")
    await player_two.get_by_role("button", name="Join Game").click()

    await expect(player_two).to_have_url(re.compile(rf"{re.escape(APP_URL)}/join\?code={re.escape(room_code)}$"))
    await expect(player_two.get_by_text('Name "SAM" is already taken in this room')).to_be_visible()
    await expect(host_page.get_by_text("SAM", exact=True)).to_have_count(1)


async def page_get_ready(page):
    await expect(page.get_by_label("Room code")).to_have_value(re.compile(r"[A-Z2-9]{6}"))
    await expect(page.get_by_label("Your name")).to_be_visible()


if __name__ == "__main__":
    asyncio.run(run_test_case("TC101", exercise))
