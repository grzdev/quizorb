import asyncio
import json

from playwright.async_api import BrowserContext, Route, expect

from _testsprite_helpers import fill_quiz_basics, open_create_page, run_test_case, submit_generate_questions


MOCK_RESPONSE = {
    "questions": [
        {
            "text": "Rapid click question",
            "options": ["One", "Two", "Three", "Four"],
            "correctIndex": 0,
            "timeLimit": 20,
        }
    ]
}


async def exercise(context: BrowserContext) -> None:
    page = await context.new_page()
    request_count = 0

    async def handle_generate(route: Route) -> None:
        nonlocal request_count
        request_count += 1
        await asyncio.sleep(0.35)
        await route.fulfill(status=200, content_type="application/json", body=json.dumps(MOCK_RESPONSE))

    await page.route("**/api/quizzes/groq-generate", handle_generate)
    await open_create_page(page)
    await fill_quiz_basics(page, title="Rapid Click Topic", host_name="RapidHost")

    generate_button = page.get_by_role("button", name="Generate Questions")
    await generate_button.click(click_count=3, delay=20)

    await expect(page.locator("body")).to_contain_text("Rapid click question")
    await expect(page.get_by_text("Rapid click question", exact=True)).to_have_count(1)
    assert request_count == 1, f"Expected one generate request, saw {request_count}"


if __name__ == "__main__":
    asyncio.run(run_test_case("TC107", exercise))
