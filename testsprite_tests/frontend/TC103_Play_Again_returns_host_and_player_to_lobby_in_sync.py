import asyncio

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import (
    complete_single_question_round,
    create_host_lobby,
    join_room,
    run_test_case,
    wait_for_host_lobby,
    wait_for_player_lobby,
)


async def exercise(context: BrowserContext) -> None:
    host_page = await context.new_page()
    room_code = await create_host_lobby(host_page, title="Replay Sync")

    player_page = await context.new_page()
    await join_room(player_page, room_code, "ReplayPlayer")

    await complete_single_question_round(host_page, [player_page])
    await host_page.get_by_role("button", name="Play Again").click()

    await wait_for_host_lobby(host_page, room_code)
    await wait_for_player_lobby(player_page, room_code)
    await expect(host_page.locator("body")).not_to_contain_text("Game Over")


if __name__ == "__main__":
    asyncio.run(run_test_case("TC103", exercise, timeout_ms=30000))
