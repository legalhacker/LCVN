import { test, expect } from "@playwright/test";

test.describe("SEO", () => {
  test("robots.txt is accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("User-Agent: *");
    expect(text).toContain("Sitemap:");
  });

  test("sitemap.xml is valid XML with URLs", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('<?xml version="1.0"');
    expect(text).toContain("<urlset");
    expect(text).toContain("<loc>");
    // Should include article pages
    expect(text).toContain("/luat/bo-luat-lao-dong/2019/dieu-35");
    // Should include topic pages
    expect(text).toContain("/topic/labor-hr");
    // Should include document pages
    expect(text).toContain("/document/labor-code-2019");
  });

  test("article pages have canonical URLs", async ({ page }) => {
    await page.goto("/luat/bo-luat-lao-dong/2019/dieu-1");
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      "href",
      /\/luat\/bo-luat-lao-dong\/2019\/dieu-1$/,
    );
  });

  test("all pages have OG tags", async ({ page }) => {
    const urls = [
      "/",
      "/topic/labor-hr",
      "/document/labor-code-2019",
      "/search",
    ];
    for (const url of urls) {
      await page.goto(url);
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute("content", /.+/);
    }
  });
});
