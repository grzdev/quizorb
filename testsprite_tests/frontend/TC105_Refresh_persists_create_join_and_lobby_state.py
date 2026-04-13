import asyncio
import re

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import APP_URL, create_host_lobby, join_room, open_create_page, run_test_case


async def exercise(context: BrowserContext) -> None:
    create_page = await context.new_page()
    await open_create_page(create_page)
    await create_page.get_by_role("button", name=re.compile("Custom")).click()
    await create_page.get_by_label("Quiz title").fill("Persisted Draft")
    await create_page.get_by_label("Host name").fill("RefreshHost")
    await create_page.get_by_label("Question prompt").fill("Will this draft survive a refresh?")
    await create_page.reload(wait_until="domcontentloaded")

    await expect(create_page).to_have_url(f"{APP_URL}/create")
    await expect(create_page.get_by_role("button", name=re.compile("Custom"))).to_be_visible()
    await expect(create_page.get_by_label("Question prompt")).to_be_visible()
    await expect(create_page.get_by_label("Quiz title")).to_have_value("Persisted Draft")
    await expect(create_page.get_by_label("Host name")).to_have_value("RefreshHost")
    await expect(create_page.get_by_label("Question prompt")).to_have_value("Will this draft survive a refresh?")

    host_page = await context.new_page()
    room_code = await create_host_lobby(host_page, title="Lobby Refresh")

    join_page = await context.new_page()
    await join_page.goto(f"{APP_URL}/join?code={room_code}", wait_until="domcontentloaded")
    await expect(join_page.get_by_label("Room code")).to_have_value(room_code)
    await join_page.get_by_label("Your name").fill("DraftPlayer")
    await join_page.reload(wait_until="domcontentloaded")

    await expect(join_page.get_by_label("Room code")).to_have_value(room_code)
    await expect(join_page.get_by_label("Your name")).to_have_value("DraftPlayer")

    player_lobby_page = await context.new_page()
    await join_room(player_lobby_page, room_code, "LobbyRefreshPlayer")

    await host_page.reload(wait_until="domcontentloaded")
    await player_lobby_page.reload(wait_until="domcontentloaded")

    await expect(host_page.locator("body")).to_contain_text(room_code)
    await expect(host_page.locator("body")).to_contain_text("LobbyRefreshPlayer")
    await expect(host_page.get_by_role("button", name="Start game")).to_be_visible()

    await expect(player_lobby_page.locator("body")).to_contain_text(room_code)
    await expect(player_lobby_page.locator("body")).to_contain_text("Waiting for the host to start")


if __name__ == "__main__":
    asyncio.run(run_test_case("TC105", exercise, timeout_ms=30000))
