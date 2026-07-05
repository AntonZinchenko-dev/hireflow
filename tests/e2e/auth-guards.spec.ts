import { expect, test, type Browser } from "@playwright/test";

async function createStrictAnonymousContext(browser: Browser) {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  // Force-disable middleware E2E bypass for this suite.
  await context.addCookies([
    {
      name: "e2e-bypass",
      value: "0",
      url: "http://localhost:3000",
    },
    {
      name: "e2e-force-anon",
      value: "1",
      url: "http://localhost:3000",
    },
  ]);

  return context;
}

test("unauthorized user is redirected from private pages to /login", async ({ browser }) => {
  const context = await createStrictAnonymousContext(browser);
  const page = await context.newPage();

  await page.goto("/vacancies");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/analytics");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/jobs");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/me");
  await expect(page).toHaveURL(/\/login$/);

  await context.close();
});

test("anonymous user can open login and register pages", async ({ browser }) => {
  const context = await createStrictAnonymousContext(browser);
  const page = await context.newPage();

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Вход в HireFlow" })).toBeVisible();

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Регистрация" })).toBeVisible();

  await context.close();
});
