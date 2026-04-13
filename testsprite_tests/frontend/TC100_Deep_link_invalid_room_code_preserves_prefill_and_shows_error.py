import asyncio
import re

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import APP_URL, open_join_page, run_test_case


FRIENDLY_INVALID_ROOM = "That room doesn't exist or may have already ended. Check the code and try again."


async def exercise(context: BrowserContext) -> None:
    page = await context.new_page()
    invalid_code = "BAD999"
    await open_join_page(page, invalid_code)

    room_code_input = page.get_by_label("Room code")
    await expect(room_code_input).to_have_value(invalid_code)

    await page.get_by_label("Your name").fill("DeepLinkPlayer")
    await page.get_by_role("button", name="Join Game").click()

    await expect(page.get_by_text(FRIENDLY_INVALID_ROOM)).to_be_visible()
    await expect(page).to_have_url(re.compile(rf"{re.escape(APP_URL)}/join\?code={invalid_code}$"))
    await expect(room_code_input).to_have_value(invalid_code)


if __name__ == "__main__":
    asyncio.run(run_test_case("TC100", exercise))
