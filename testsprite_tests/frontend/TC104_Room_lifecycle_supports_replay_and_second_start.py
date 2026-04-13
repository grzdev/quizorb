import asyncio

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import (
    complete_single_question_round,
    create_host_lobby,
    join_room,
    run_test_case,
    start_game,
)


async def exercise(context: BrowserContext) -> None:
    host_page = await context.new_page()
    room_code = await create_host_lobby(host_page, title="Lifecycle Replay")

    player_page = await context.new_page()
    await join_room(player_page, room_code, "LifecyclePlayer")

    await complete_single_question_round(host_page, [player_page])
    await host_page.get_by_role("button", name="Play Again").click()

    await start_game(host_page)
    await expect(host_page.locator("body")).to_contain_text("2+2?")
    await expect(player_page.locator("body")).to_contain_text("2+2?")


if __name__ == "__main__":
    asyncio.run(run_test_case("TC104", exercise, timeout_ms=30000))
