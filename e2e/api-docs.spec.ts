import { test, expect } from "@playwright/test";

test.describe("API Documentation page", () => {
  test("renders page title and base URL info", async ({ page }) => {
    await page.goto("/api-docs");
    await expect(page.locator("h1")).toContainText("API Documentation");
    await expect(page.getByText("/api/v1", { exact: true })).toBeVisible();
  });

  test("shows all endpoint cards", async ({ page }) => {
    await page.goto("/api-docs");
    const endpoints = [
      "List documents",
      "Get single document",
      "Get article",
      "Get relationships",
      "Full-text search",
    ];
    for (const title of endpoints) {
      await expect(page.locator(`text=${title}`).first()).toBeVisible();
    }
  });

  test("has canonical ID reference table", async ({ page }) => {
    await page.goto("/api-docs");
    await expect(page.locator("text=Canonical ID Format")).toBeVisible();
    await expect(page.locator("text=VN_LLD_2019_D35_K1_A").first()).toBeVisible();
  });

  test("has relationship types table", async ({ page }) => {
    await page.goto("/api-docs");
    await expect(page.locator("text=Relationship Types")).toBeVisible();
    await expect(page.locator("text=amended_by")).toBeVisible();
  });

  test("has correct meta tags", async ({ page }) => {
    await page.goto("/api-docs");
    await expect(page).toHaveTitle(/API Documentation/);
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /API Documentation/);
  });

  test("footer links to API docs", async ({ page }) => {
    await page.goto("/");
    const apiLink = page.locator("footer a", { hasText: "API" });
    await expect(apiLink).toHaveAttribute("href", "/api-docs");
  });
});
