# SauceDemo QA Suite

[![Playwright Tests](https://github.com/Samin-Zaman1/saucedemo-qa-suite/actions/workflows/playwright.yml/badge.svg)](https://github.com/Samin-Zaman1/saucedemo-qa-suite/actions/workflows/playwright.yml)

Playwright + TypeScript UI tests for [saucedemo.com](https://www.saucedemo.com), built with the Page Object Model and custom Playwright fixtures, running in GitHub Actions on every push and pull request.

## What's covered

**Login** (`tests/login.spec.ts`)
- valid user reaches the products page
- locked out user sees an error message
- blank credentials are rejected
- invalid password is rejected
- whitespace-only username is rejected

**Cart** (`tests/cart.spec.ts`)
- add item to cart
- removing an item clears the cart badge

## Design decisions

- **Page Object Model** — locators and actions live in `pages/`, so a UI change is fixed in one place instead of every test.
- **Fixtures for shared setup** — `fixtures/index.ts` provides `loginPage` (already navigated) and `inventoryPage`; login stays explicit in each spec because login tests need different credentials per test.
- **Locator priority** — `getByRole` / `getByPlaceholder` first, `getByTestId` where there's no stable accessible name.
- **Verified assertions** — expected error text is taken from the app's actual messages, not assumed.

## Run locally

```bash
npm ci
npx playwright install
npx playwright test
```
