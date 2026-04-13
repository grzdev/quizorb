import os
import re
from pathlib import Path
from typing import Awaitable, Callable, Iterable

from playwright import async_api
from playwright.async_api import Browser, BrowserContext, Page, Playwright, expect


APP_URL = os.getenv("TESTSPRITE_APP_URL", "http://localhost:5173").rstrip("/")
ROOM_CODE_RE = re.compile(r"[A-Z2-9]{6}")
ARTIFACT_DIR = Path(__file__).resolve().parent / "execution_artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

TestBody = Callable[[BrowserContext], Awaitable[None]]


def _sanitize_name(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value).strip("_")


async def launch_browser_context(timeout_ms: int = 20000) -> tuple[Playwright, Browser, BrowserContext]:
    playwright = await async_api.async_playwright().start()
    browser = await playwright.chromium.launch(headless=True)
    context = await browser.new_context(viewport={"width": 1280, "height": 720})
    context.set_default_timeout(timeout_ms)
    context.set_default_navigation_timeout(timeout_ms)
    return playwright, browser, context


async def close_browser_context(
    playwright: Playwright | None,
    browser: Browser | None,
    context: BrowserContext | None,
) -> None:
    if context:
        await context.close()
    if browser:
        await browser.close()
    if playwright:
        await playwright.stop()


async def capture_failure_screenshots(context: BrowserContext, test_name: str) -> list[Path]:
    captured: list[Path] = []
    safe_test_name = _sanitize_name(test_name)
    for index, page in enumerate(context.pages, start=1):
        if page.is_closed():
            continue
        target = ARTIFACT_DIR / f"{safe_test_name}_failure_page{index}.png"
        await page.screenshot(path=str(target), full_page=True)
        captured.append(target)
    return captured


async def run_test_case(test_name: str, test_body: TestBody, *, timeout_ms: int = 20000) -> None:
    playwright = None
    browser = None
    context = None

    try:
        playwright, browser, context = await launch_browser_context(timeout_ms)
        await test_body(context)
    except Exception:
        if context:
            await capture_failure_screenshots(context, test_name)
        raise
    finally:
        await close_browser_context(playwright, browser, context)


async def open_create_page(page: Page) -> None:
    await page.goto(f"{APP_URL}/create", wait_until="domcontentloaded")
    await expect(page.get_by_label("Quiz title")).to_be_visible()
    await expect(page.get_by_label("Host name")).to_be_visible()


async def open_join_page(page: Page, room_code: str | None = None) -> None:
    join_url = f"{APP_URL}/join?code={room_code}" if room_code else f"{APP_URL}/join"
    await page.goto(join_url, wait_until="domcontentloaded")
    await expect(page.get_by_label("Room code")).to_be_visible()
    await expect(page.get_by_label("Your name")).to_be_visible()


async def select_mode(page: Page, mode_name: str) -> None:
    await page.get_by_role("button", name=re.compile(re.escape(mode_name), re.IGNORECASE)).click()


async def fill_quiz_basics(page: Page, *, title: str, host_name: str) -> None:
    await page.get_by_label("Quiz title").fill(title)
    await page.get_by_label("Host name").fill(host_name)


async def add_custom_question(
    page: Page,
    *,
    question_text: str,
    option_a: str,
    option_b: str,
    option_c: str,
    option_d: str,
) -> None:
    await page.get_by_label("Question prompt").fill(question_text)
    await page.get_by_label("Option A").fill(option_a)
    await page.get_by_label("Option B").fill(option_b)
    await page.get_by_label("Option C").fill(option_c)
    await page.get_by_label("Option D").fill(option_d)
    await page.get_by_role("button", name=re.compile(r"Add Question")).click()


async def create_custom_room(
    page: Page,
    *,
    title: str,
    host_name: str = "HostPlayer",
    question_text: str = "2+2?",
    option_a: str = "4",
    option_b: str = "3",
    option_c: str = "5",
    option_d: str = "6",
) -> str:
    await open_create_page(page)
    await select_mode(page, "Custom")
    await add_custom_question(
        page,
        question_text=question_text,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
    )
    await fill_quiz_basics(page, title=title, host_name=host_name)
    await page.get_by_role("button", name="Create Room").click()

    room_code_locator = page.locator(".room-code-value")
    await expect(room_code_locator).to_be_visible()
    await expect(page.get_by_role("button", name=re.compile(r"Go to lobby"))).to_be_visible()
    room_code = ((await room_code_locator.text_content()) or "").strip().upper()
    assert ROOM_CODE_RE.fullmatch(room_code), f"Expected a generated room code, got {room_code!r}"
    return room_code


async def create_host_lobby(
    page: Page,
    *,
    title: str,
    host_name: str = "HostPlayer",
    question_text: str = "2+2?",
) -> str:
    room_code = await create_custom_room(
        page,
        title=title,
        host_name=host_name,
        question_text=question_text,
    )
    await page.get_by_role("button", name=re.compile(r"Go to lobby")).click()
    await wait_for_host_lobby(page, room_code)
    return room_code


async def choose_preset_topic(page: Page, topic_name: str) -> None:
    await page.get_by_role("button", name=re.compile(re.escape(topic_name), re.IGNORECASE)).click()


async def choose_question_count(page: Page, count: int) -> None:
    await page.get_by_role("button", name=re.compile(rf"^{count}$")).click()


async def submit_generate_questions(page: Page) -> None:
    await page.get_by_role("button", name=re.compile(r"^(Generate Questions|Regenerate)$")).click()


async def wait_for_generated_review(page: Page) -> None:
    await expect(page.get_by_role("button", name="Create Room")).to_be_visible()


async def join_room(page: Page, room_code: str, player_name: str, *, via_deep_link: bool = False) -> None:
    await open_join_page(page, room_code if via_deep_link else None)

    room_code_input = page.get_by_label("Room code")
    if not via_deep_link:
        await room_code_input.fill(room_code)
    else:
        await expect(room_code_input).to_have_value(room_code)

    await page.get_by_label("Your name").fill(player_name)
    await page.get_by_role("button", name="Join Game").click()

    await expect(page).to_have_url(re.compile(rf"{re.escape(APP_URL)}/play/{re.escape(room_code)}$"))
    await wait_for_player_lobby(page, room_code)


async def start_game(host_page: Page) -> None:
    start_button = host_page.get_by_role("button", name="Start game")
    await expect(start_button).to_be_visible()
    await expect(start_button).to_be_enabled()
    await start_button.click()


async def answer_question(page: Page, option_text: str = "4") -> None:
    option_button = page.get_by_role("button", name=option_text, exact=True)
    await expect(option_button).to_be_visible()
    await expect(option_button).to_be_enabled()
    await option_button.click()


async def wait_for_host_finished(host_page: Page) -> None:
    await expect(host_page.locator("body")).to_contain_text("Game Over")
    await expect(host_page.get_by_role("button", name="Play Again")).to_be_visible()


async def wait_for_player_finished(player_page: Page) -> None:
    await expect(player_page.get_by_role("button", name=re.compile(r"Back to Home"))).to_be_visible()


async def wait_for_player_lobby(player_page: Page, room_code: str) -> None:
    await expect(player_page.locator("body")).to_contain_text(room_code)
    await expect(player_page.locator("body")).to_contain_text("Waiting for the host to start")


async def wait_for_host_lobby(host_page: Page, room_code: str) -> None:
    await expect(host_page).to_have_url(re.compile(rf"{re.escape(APP_URL)}/host/{re.escape(room_code)}$"))
    await expect(host_page.locator("body")).to_contain_text(room_code)
    await expect(host_page.get_by_role("button", name="Start game")).to_be_visible()


async def complete_single_question_round(host_page: Page, player_pages: Iterable[Page]) -> None:
    await start_game(host_page)
    await answer_question(host_page)
    for player_page in player_pages:
        await answer_question(player_page)
    await wait_for_host_finished(host_page)
    for player_page in player_pages:
        await wait_for_player_finished(player_page)
