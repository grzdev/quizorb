# Frontend Report Round 4

Executed: 2026-04-13T20:58:21.3479532+01:00
Frontend: http://localhost:5173
Backend: http://localhost:4000

Summary: 3/4 passed, 1 failed

## TC001_Host_triggers_Play_Again_and_returns_to_lobby_for_a_new_run
- Status: failed
- Exit code: 1
- Duration: 7.08s
- Stdout log: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC001_Host_triggers_Play_Again_and_returns_to_lobby_for_a_new_run.stdout.log
- Stderr log: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC001_Host_triggers_Play_Again_and_returns_to_lobby_for_a_new_run.stderr.log
- Screenshots: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC001_Host_triggers_Play_Again_and_returns_to_lobby_for_a_new_run_TC001_failure_page1.png, C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC001_Host_triggers_Play_Again_and_returns_to_lobby_for_a_new_run_TC001_failure_page2.png
- Failure excerpt:
```text
Traceback (most recent call last):
  File "C:\Users\raiden\quizdrop\testsprite_tests\frontend\TC001_Host_triggers_Play_Again_and_returns_to_lobby_for_a_new_run.py", line 31, in <module>
    asyncio.run(run_test_case("TC001", exercise, timeout_ms=30000))
  File "C:\Users\raiden\AppData\Local\Programs\Python\Python312\Lib\asyncio\runners.py", line 195, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\raiden\AppData\Local\Programs\Python\Python312\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\raiden\AppData\Local\Programs\Python\Python312\Lib\asyncio\base_events.py", line 691, in run_until_complete
    return future.result()
           ^^^^^^^^^^^^^^^
  File "C:\Users\raiden\quizdrop\testsprite_tests\frontend\_testsprite_helpers.py", line 63, in run_test_case
    await test_body(context)
  File "C:\Users\raiden\quizdrop\testsprite_tests\frontend\TC001_Host_triggers_Play_Again_and_returns_to_lobby_for_a_new_run.py", line 22, in exercise
    await complete_single_question_round(host_page, [player_page])
  File "C:\Users\raiden\quizdrop\testsprite_tests\frontend\_testsprite_helpers.py", line 229, in complete_single_question_round
    await answer_question(host_page)
  File "C:\Users\raiden\quizdrop\testsprite_tests\frontend\_testsprite_helpers.py", line 202, in answer_question
    await expect(option_button).to_be_visible()
  File "C:\Users\raiden\AppData\Local\Programs\Python\Python312\Lib\site-packages\playwright\async_api\_generated.py", line 20372, in to_be_visible
    await self._impl_obj.to_be_visible(visible=visible, timeout=timeout)
  File "C:\Users\raiden\AppData\Local\Programs\Python\Python312\Lib\site-packages\playwright\_impl\_assertions.py", line 765, in to_be_visible
    await self._expect_impl(
  File "C:\Users\raiden\AppData\Local\Programs\Python\Python312\Lib\site-packages\playwright\_impl\_assertions.py", line 85, in _expect_impl
    raise AssertionError(
AssertionError: Locator expected to be visible
Actual value: None
Error: element(s) not found 
Call log:
  - Expect "to_be_visible" with timeout 5000ms
  - waiting for get_by_role("button", name="4", exact=True)
```

## TC009_Join_via_deep_link_with_prefilled_room_code
- Status: passed
- Exit code: 0
- Duration: 2.02s
- Stdout log: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC009_Join_via_deep_link_with_prefilled_room_code.stdout.log
- Stderr log: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC009_Join_via_deep_link_with_prefilled_room_code.stderr.log
- Screenshots: none

## TC011_Generate_trivia_set_from_preset_topic_and_reach_review
- Status: passed
- Exit code: 0
- Duration: 6.05s
- Stdout log: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC011_Generate_trivia_set_from_preset_topic_and_reach_review.stdout.log
- Stderr log: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC011_Generate_trivia_set_from_preset_topic_and_reach_review.stderr.log
- Screenshots: none

## TC108_Join_form_validates_empty_inputs_and_invalid_codes
- Status: passed
- Exit code: 0
- Duration: 2.01s
- Stdout log: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC108_Join_form_validates_empty_inputs_and_invalid_codes.stdout.log
- Stderr log: C:\Users\raiden\quizdrop\testsprite_tests\execution_artifacts_round4\TC108_Join_form_validates_empty_inputs_and_invalid_codes.stderr.log
- Screenshots: none

