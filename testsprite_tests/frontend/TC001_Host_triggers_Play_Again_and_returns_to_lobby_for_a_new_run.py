import asyncio
import re

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import (
    create_host_lobby,
    join_room,
    run_test_case,
    start_game,
    wait_for_host_finished,
    wait_for_host_lobby,
    wait_for_player_finished,
    wait_for_player_lobby,
)


async def answer_visible_option(page, option_text: str = "4") -> None:
    option_button = page.get_by_role(
        "button",
        name=re.compile(rf"(?:^|.*\s){re.escape(option_text)}$"),
    )
    await expect(option_button).to_be_visible()
    await expect(option_button).to_be_enabled()
    await option_button.click()


async def exercise(context: BrowserContext) -> None:
    host_page = await context.new_page()
    room_code = await create_host_lobby(host_page, title="Play Again Regression")

    player_page = await context.new_page()
    await join_room(player_page, room_code, "ReplayPlayer")

    await start_game(host_page)
    await answer_visible_option(host_page)
    await answer_visible_option(player_page)
    await wait_for_host_finished(host_page)
    await wait_for_player_finished(player_page)
    await host_page.get_by_role("button", name="Play Again").click()

    await wait_for_host_lobby(host_page, room_code)
    await wait_for_player_lobby(player_page, room_code)
    await expect(host_page.locator("body")).not_to_contain_text("Game Over")


if __name__ == "__main__":
    asyncio.run(run_test_case("TC001", exercise, timeout_ms=30000))
