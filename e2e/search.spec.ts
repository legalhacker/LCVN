import { test, expect } from "@playwright/test";

test.describe("Search page", () => {
  test("renders empty state without query", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1")).toContainText("Search");
    await expect(page.locator("text=Enter a search term")).toBeVisible();
  });

  test("shows results for Vietnamese query", async ({ page }) => {
    await page.goto("/search?q=AI");
    const resultCount = page.locator(".text-xs.text-gray-400").filter({ hasText: "result" });
    await expect(resultCount).toBeVisible();
    // Should find regulatory change links
    const links = page.locator('a[href*="/thay-doi/"]');
    await expect(links.first()).toBeVisible();
  });

  test("search form submits and shows results", async ({ page }) => {
    await page.goto("/search");
    const input = page.locator('main input[name="q"]');
    await input.fill("AI");
    await input.press("Enter");
    await page.waitForURL(/search\?q=AI/);
    // Should show result count text
    await expect(page.locator("text=results for").or(page.locator("text=result for"))).toBeVisible();
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
