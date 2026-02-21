import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders regulatory feed with law-prefixed titles", async ({ page }) => {
    await page.goto("/");
    const articles = page.locator("article");
    await expect(articles).toHaveCount(2);
    await expect(page.locator("text=[Luật SHTT]").first()).toBeVisible();
  });

  test("feed items link to change detail pages", async ({ page }) => {
    await page.goto("/");
    const links = page.locator('article a[href*="/thay-doi/"]');
    await expect(links.first()).toBeVisible();
  });

  test("has correct meta tags", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/LCVN/);
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /LCVN/);
  });

  test("has WebSite JSON-LD", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const content = await jsonLd.textContent();
    const data = JSON.parse(content!);
    expect(data["@type"]).toBe("WebSite");
    expect(data.potentialAction["@type"]).toBe("SearchAction");
  });
});

test.describe("Change detail page", () => {
  test("renders analysis and comparison for feed item", async ({ page }) => {
    await page.goto("/thay-doi/shtt-ai-ownership");
    await expect(page.locator("h1")).toContainText("[Luật SHTT]");
    await expect(page.getByRole("heading", { name: "Phân tích thay đổi" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "So sánh" })).toBeVisible();
  });

  test("shows before/after comparison", async ({ page }) => {
    await page.goto("/thay-doi/shtt-ai-training-data");
    await expect(page.locator("text=Trước thay đổi")).toBeVisible();
    await expect(page.locator("text=Sau thay đổi")).toBeVisible();
  });

  test("has breadcrumb back to home", async ({ page }) => {
    await page.goto("/thay-doi/shtt-ai-ownership");
    const homeLink = page.getByRole("main").locator("nav a", { hasText: "Trang chủ" });
    await expect(homeLink).toHaveAttribute("href", "/");
  });

  test("returns 404 for nonexistent change", async ({ page }) => {
    const response = await page.goto("/thay-doi/nonexistent");
    expect(response?.status()).toBe(404);
  });
});


test.describe("Topic page", () => {
  test("lists documents for a topic", async ({ page }) => {
    await page.goto("/topic/labor-hr");
    await expect(page.locator("h1")).toContainText("Labor & HR");
    await expect(page.locator('main a[href="/document/labor-code-2019"]')).toBeVisible();
  });

  test("breadcrumb links back to home", async ({ page }) => {
    await page.goto("/topic/civil-law");
    const homeLink = page.locator("nav a", { hasText: "Home" });
    await expect(homeLink).toHaveAttribute("href", "/");
  });

  test("returns 404 for invalid topic", async ({ page }) => {
    const response = await page.goto("/topic/nonexistent");
    expect(response?.status()).toBe(404);
  });
});
