# SauceDemo QA Suite

[![Playwright Tests](https://github.com/Samin-Zaman1/saucedemo-qa-suite/actions/workflows/playwright.yml/badge.svg)](https://github.com/Samin-Zaman1/saucedemo-qa-suite/actions/workflows/playwright.yml)

Playwright + TypeScript UI tests for saucedemo.com using the Page Object Model, running in GitHub Actions.

## What's covered

- Valid user reaches the products page.
- Locked out user sees an error message.
- Blank credentials are rejected.

## Run locally

```bash
npm ci
npx playwright install
npx playwright test
```