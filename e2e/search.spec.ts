import { test, expect } from "@playwright/test";

test.describe("Search page", () => {
  test("renders empty state without query", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1")).toContainText("Search");
    await expect(page.locator("text=Enter a search term")).toBeVisible();
  });

  test("shows results for Vietnamese query", async ({ page }) => {
    await page.goto("/search?q=hợp đồng");
    await expect(page.locator("text=result")).toBeVisible();
    // Should find results from both Labor Code and Civil Code
    const links = page.locator('a[href*="/luat/"]');
    await expect(links.first()).toBeVisible();
  });

  test("type filter narrows results", async ({ page }) => {
    await page.goto("/search?q=lao&type=article");
    // Article filter pill should be active
    const activeFilter = page.locator("a.bg-gray-900", { hasText: "Articles" });
    await expect(activeFilter).toBeVisible();
  });

  test("search form submits and shows results", async ({ page }) => {
    await page.goto("/search");
    const input = page.locator('main input[name="q"]');
    await input.fill("lao");
    await input.press("Enter");
    await page.waitForURL(/search\?q=lao/);
    // Should show result count text
    await expect(page.locator("text=result")).toBeVisible();
  });

  test("header search bar navigates to search page", async ({ page }) => {
    await page.goto("/");
    const headerInput = page.locator("header input[name='q']");
    await headerInput.fill("bảo hiểm");
    await page.locator("header form").evaluate((form: HTMLFormElement) =>
      form.submit(),
    );
    await page.waitForURL(/search\?q=/);
    await expect(page.locator("h1")).toContainText("Search");
  });
});
