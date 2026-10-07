# SauceDemo QA Suite

[![Playwright Tests](https://github.com/Samin-Zaman1/saucedemo-qa-suite/actions/workflows/playwright.yml/badge.svg)](https://github.com/Samin-Zaman1/saucedemo-qa-suite/actions/workflows/playwright.yml)

Playwright + TypeScript end-to-end tests for [saucedemo.com](https://www.saucedemo.com) plus API tests for [reqres.in](https://reqres.in), built with the Page Object Model and custom fixtures, and run in GitHub Actions on every push and pull request.

**[View the latest test report](https://samin-zaman1.github.io/saucedemo-qa-suite/)**, published from `main` on every run.

## What's covered

38 tests across 6 spec files.

| Area | Spec | What the tests check |
| --- | --- | --- |
| Login | `tests/login.spec.ts` | valid login, locked-out user, blank credentials, wrong password, whitespace-only username |
| Cart | `tests/cart.spec.ts` | add and remove from the products page, cart lists exactly what was added, remove from the cart page, cart survives navigation |
| Checkout | `tests/checkout.spec.ts` | full purchase to the confirmation page, item total + 8% tax + grand total add up, each required field blocks checkout, cancelling at either step keeps the cart |
| Sorting | `tests/sorting.spec.ts` | default order, and all four sort options produce a correctly ordered list without adding or dropping products |
| Known bugs | `tests/known-bugs.spec.ts` | 11 defects across SauceDemo's test accounts (below), plus a full purchase on the deliberately slow account |
| Users API | `tests/users-api.spec.ts` | get a user, 404 with empty body for a missing user, create, update |

## Bugs found

SauceDemo ships accounts with deliberate defects. Each one below was reproduced and is covered by an expected-failure test: it asserts the **correct** behaviour and is marked `test.fail()`. While the bug exists the run stays green; if it is ever fixed, the test passes unexpectedly and the run goes red, so the fix gets noticed and the test promoted.

| Account | Defect |
| --- | --- |
| `standard_user` | With every product except the backpack in the cart, the overview shows **"Item total: $99.94999999999999"**: a floating-point sum displayed without rounding. This is on the main happy path. |
| `problem_user` | All six products show the same 404 placeholder image |
| `problem_user` | Sorting has no effect |
| `problem_user` | Only some "Add to cart" buttons work; the badge stops at 2 of 6 |
| `problem_user` | "Remove" on the products page does nothing |
| `problem_user` | Typing in Last Name overwrites First Name, so checkout can never pass validation |
| `error_user` | Sorting raises a "Sorting is broken!" alert and leaves the list unsorted |
| `error_user` | A blank last name passes validation |
| `error_user` | "Finish" does nothing; the order is never placed |
| `visual_user` | Product list prices are random and change on every sort; the cart charges the real price |
| `visual_user` | The backpack image is the 404 placeholder |

Each bug carries a `known bug` annotation, visible next to the test in the HTML report.

## Design decisions

- **Page Object Model.** `pages/` holds one class per screen (`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`), so a UI change is fixed in one place. Products are found by their visible name (`inventoryPage.addToCart('Sauce Labs Backpack')`), not by generated IDs.
- **Fixtures for shared setup.** `fixtures/index.ts` provides each page object, with `loginPage` already navigated. Login stays explicit in each spec because different tests need different accounts.
- **Assertions derive expectations, not snapshots.** Sorting tests compute the expected order from the prices and names on screen; the checkout test recomputes item total, tax and grand total from the listed prices. A catalogue change won't break them, but a wrong calculation will.
- **Money in whole cents.** `data/money.ts` converts prices to integer cents before comparing, so the tests don't inherit the floating-point error they caught in the app.
- **No sleeps.** The deliberately slow `performance_glitch_user` completes a purchase through Playwright's auto-waiting alone.
- **Locator priority.** `getByRole` and `getByPlaceholder` first, `getByTestId` where there's no stable accessible name.
- **API client as a page object.** `pages/UsersApi.ts` wraps reqres endpoints the same way UI page objects wrap screens. The key comes from the environment; without it the API tests are skipped (e.g. on fork PRs, which don't receive secrets). Tracing is off for these tests because traces record request headers and the report is public.

## CI

`.github/workflows/playwright.yml` runs on every push and pull request to `main`: typecheck, then the full suite on Chromium. The HTML report is uploaded as an artifact on every run and published to GitHub Pages from `main`. Failures also appear as inline annotations on the pull request.

## Run locally

```bash
npm ci
npx playwright install chromium
cp .env.example .env    # add your reqres.in API key (optional; API tests skip without it)
npm test                # run everything
npm run typecheck       # tsc --noEmit
npm run report          # open the last HTML report
```

In CI the key is read from the `REQRES_API_KEY` repository secret.
