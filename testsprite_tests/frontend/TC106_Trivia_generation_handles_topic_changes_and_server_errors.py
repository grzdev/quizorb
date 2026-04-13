import asyncio
import json

from playwright.async_api import BrowserContext, Route, expect

from _testsprite_helpers import (
    choose_preset_topic,
    fill_quiz_basics,
    open_create_page,
    run_test_case,
    submit_generate_questions,
    wait_for_generated_review,
)


SCIENCE_RESPONSE = {
    "questions": [
        {
            "text": "Science question one",
            "options": ["Alpha", "Beta", "Gamma", "Delta"],
            "correctIndex": 0,
            "timeLimit": 20,
        }
    ]
}

HISTORY_RESPONSE = {
    "questions": [
        {
            "text": "History question one",
            "options": ["1066", "1492", "1776", "1914"],
            "correctIndex": 0,
            "timeLimit": 20,
        }
    ]
}


async def exercise(context: BrowserContext) -> None:
    page = await context.new_page()
    seen_topics: list[str] = []

    async def handle_generate(route: Route) -> None:
        payload = json.loads(route.request.post_data or "{}")
        topic = str(payload.get("topic", ""))
        seen_topics.append(topic)

        if topic == "Science":
            await route.fulfill(status=200, content_type="application/json", body=json.dumps(SCIENCE_RESPONSE))
            return
        if topic == "History":
            await route.fulfill(status=200, content_type="application/json", body=json.dumps(HISTORY_RESPONSE))
            return

        await route.fulfill(
            status=500,
            content_type="application/json",
            body=json.dumps({"error": "Failed to generate quiz", "details": "Topic request rejected"}),
        )

    await page.route("**/api/quizzes/groq-generate", handle_generate)
    await open_create_page(page)
    await fill_quiz_basics(page, title="Topic Switching", host_name="TopicHost")

    await choose_preset_topic(page, "Science")
    await submit_generate_questions(page)
    await wait_for_generated_review(page)
    await expect(page.locator("body")).to_contain_text("Science question one")

    await choose_preset_topic(page, "History")
    await submit_generate_questions(page)
    await expect(page.locator("body")).to_contain_text("History question one")
    await expect(page.locator("body")).not_to_contain_text("Science question one")

    await page.get_by_role("button", name="AI").click()
    await page.locator('input[placeholder*="Afrobeats"]').fill("??? invalid topic ???")
    await submit_generate_questions(page)

    await expect(page.get_by_text("Topic request rejected")).to_be_visible()
    assert seen_topics == ["Science", "History", "??? invalid topic ???"], f"Unexpected topics: {seen_topics!r}"


if __name__ == "__main__":
    asyncio.run(run_test_case("TC106", exercise))
