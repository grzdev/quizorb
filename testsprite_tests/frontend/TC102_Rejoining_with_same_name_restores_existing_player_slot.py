import asyncio

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import create_host_lobby, join_room, run_test_case


async def exercise(context: BrowserContext) -> None:
    host_page = await context.new_page()
    room_code = await create_host_lobby(host_page, title="Reconnect Same Name")

    first_player_page = await context.new_page()
    await join_room(first_player_page, room_code, "REJOINER")
    await expect(host_page.get_by_text("REJOINER", exact=True)).to_have_count(1)

    await first_player_page.close()
    await host_page.wait_for_timeout(750)

    reconnect_page = await context.new_page()
    await join_room(reconnect_page, room_code, "REJOINER", via_deep_link=True)

    await expect(host_page.get_by_text("REJOINER", exact=True)).to_have_count(1)
    await expect(reconnect_page.locator("body")).to_contain_text(room_code)
    await expect(reconnect_page.locator("body")).to_contain_text("Waiting for the host to start")


if __name__ == "__main__":
    asyncio.run(run_test_case("TC102", exercise))
