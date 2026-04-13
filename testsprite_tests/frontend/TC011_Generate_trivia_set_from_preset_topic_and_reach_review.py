import asyncio

from playwright.async_api import BrowserContext, expect

from _testsprite_helpers import (
    choose_preset_topic,
    choose_question_count,
    fill_quiz_basics,
    open_create_page,
    run_test_case,
    submit_generate_questions,
    wait_for_generated_review,
)


async def exercise(context: BrowserContext) -> None:
    page = await context.new_page()
    await open_create_page(page)
    await fill_quiz_basics(page, title="Friday Night Trivia", host_name="Alex")
    await choose_preset_topic(page, "Science")
    await choose_question_count(page, 10)
    await submit_generate_questions(page)

    await wait_for_generated_review(page)
    await expect(page.locator("body")).to_contain_text("Create Room")


if __name__ == "__main__":
    asyncio.run(run_test_case("TC011", exercise, timeout_ms=45000))
