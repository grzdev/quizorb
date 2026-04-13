import asyncio

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import create_custom_room, run_test_case


async def exercise(context: BrowserContext) -> None:
    page = await context.new_page()
    room_code = await create_custom_room(page, title="Math Quick Quiz", host_name="HostPlayer")

    await expect(page.locator("body")).to_contain_text(room_code)
    await expect(page.get_by_role("button", name="Go to lobby")).to_be_visible()
    await expect(page.locator("body")).to_contain_text("Room created")


if __name__ == "__main__":
    asyncio.run(run_test_case("TC008", exercise))
