import asyncio
import re

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import APP_URL, create_custom_room, join_room, run_test_case


async def exercise(context: BrowserContext) -> None:
    host_page = await context.new_page()
    room_code = await create_custom_room(host_page, title="Deep Link Join Test")

    player_page = await context.new_page()
    await join_room(player_page, room_code, "PLAYER01", via_deep_link=True)

    await expect(player_page).to_have_url(re.compile(rf"{re.escape(APP_URL)}/play/{re.escape(room_code)}$"))
    await expect(player_page.locator("body")).to_contain_text(room_code)
    await expect(player_page.locator("body")).to_contain_text("Waiting for the host to start")


if __name__ == "__main__":
    asyncio.run(run_test_case("TC009", exercise))
