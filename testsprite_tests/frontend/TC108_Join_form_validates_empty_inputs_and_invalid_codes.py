import asyncio

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import open_join_page, run_test_case


FRIENDLY_INVALID_ROOM = "That room doesn't exist or may have already ended. Check the code and try again."


async def exercise(context: BrowserContext) -> None:
    page = await context.new_page()
    await open_join_page(page)

    await page.get_by_role("button", name="Join Game").click()
    await expect(page.get_by_text("Please enter your name.")).to_be_visible()

    await page.get_by_label("Your name").fill("ValidationPlayer")
    await page.get_by_role("button", name="Join Game").click()
    await expect(page.get_by_text("Please enter a room code.")).to_be_visible()

    await page.get_by_label("Room code").fill("MISSING")
    await page.get_by_role("button", name="Join Game").click()
    await expect(page.get_by_text(FRIENDLY_INVALID_ROOM)).to_be_visible()


if __name__ == "__main__":
    asyncio.run(run_test_case("TC108", exercise))
