import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders regulatory intelligence page with sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Regulatory Intelligence");
    await expect(page.locator("text=Văn bản mới có hiệu lực")).toBeVisible();
    await expect(page.locator("text=Sự kiện thay đổi pháp luật")).toBeVisible();
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

  test("has filter bar with domain dropdown", async ({ page }) => {
    await page.goto("/");
    const filterBar = page.locator("text=Lĩnh vực").first();
    await expect(filterBar).toBeVisible();
  });
});

test.describe("Dữ liệu pháp luật page", () => {
  test("renders legal field grid", async ({ page }) => {
    await page.goto("/du-lieu-phap-luat");
    await expect(page.locator("h1")).toContainText("Dữ liệu pháp luật");
    await expect(page.locator("text=Đầu tư & Doanh nghiệp")).toBeVisible();
    await expect(page.locator("text=Lao động & Nhân sự")).toBeVisible();
    await expect(page.locator("text=Thuế")).toBeVisible();
  });

  test("has topic links", async ({ page }) => {
    await page.goto("/du-lieu-phap-luat");
    await expect(page.locator('a[href="/topic/corporate-law"]')).toBeVisible();
    await expect(page.locator('a[href="/topic/labor-hr"]')).toBeVisible();
    await expect(page.locator('a[href="/topic/tax"]')).toBeVisible();
  });

  test("has search bar", async ({ page }) => {
    await page.goto("/du-lieu-phap-luat");
    await expect(page.getByRole("textbox", { name: "Tìm kiếm văn bản pháp luật..." })).toBeVisible();
  });
});

test.describe("Văn bản sắp có hiệu lực page", () => {
  test("renders page with heading", async ({ page }) => {
    await page.goto("/van-ban-sap-co-hieu-luc");
    await expect(page.locator("h1")).toContainText("Văn bản sắp có hiệu lực");
  });

  test("has filter bar", async ({ page }) => {
    await page.goto("/van-ban-sap-co-hieu-luc");
    const filterBar = page.locator("text=Lĩnh vực").first();
    await expect(filterBar).toBeVisible();
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

test.describe("Document page", () => {
  test("shows document metadata and articles", async ({ page }) => {
    await page.goto("/document/labor-code-2019");
    await expect(page.locator("h1")).toContainText("Labor Code 2019");
    // Should show document number
    await expect(page.locator("text=45/2019/QH14")).toBeVisible();
    // Should list articles from DB
    await expect(page.locator('a[href*="/luat/bo-luat-lao-dong/2019/dieu-"]').first()).toBeVisible();
  });

  test("shows Civil Code articles from DB", async ({ page }) => {
    await page.goto("/document/civil-code-2015");
    await expect(page.locator("h1")).toContainText("Civil Code 2015");
    await expect(page.locator('a[href*="/luat/bo-luat-dan-su/2015/dieu-"]').first()).toBeVisible();
  });

  test("shows fallback for document without DB data", async ({ page }) => {
    await page.goto("/document/investment-law-2020");
    await expect(page.locator("text=not yet available")).toBeVisible();
  });

  test("breadcrumb includes topic link", async ({ page }) => {
    await page.goto("/document/labor-code-2019");
    const topicLink = page.locator("nav a", { hasText: "Labor & HR" });
    await expect(topicLink).toHaveAttribute("href", "/topic/labor-hr");
  });
});

test.describe("Article source page", () => {
  test("renders article with clauses and points", async ({ page }) => {
    await page.goto("/luat/bo-luat-lao-dong/2019/dieu-35");
    await expect(page.locator("h1")).toContainText("Điều 35");
    // Should have clause headings
    await expect(page.getByRole("heading", { name: "Khoản 1" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Khoản 2" })).toBeVisible();
  });

  test("has stable anchor IDs", async ({ page }) => {
    await page.goto("/luat/bo-luat-lao-dong/2019/dieu-35");
    await expect(page.locator("#dieu-35")).toBeVisible();
    await expect(page.locator("#khoan-1")).toBeVisible();
    await expect(page.locator("#khoan-2")).toBeVisible();
  });

  test("has Legislation JSON-LD", async ({ page }) => {
    await page.goto("/luat/bo-luat-lao-dong/2019/dieu-35");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const content = await jsonLd.textContent();
    const data = JSON.parse(content!);
    expect(data["@type"]).toBe("Legislation");
    expect(data.legislationIdentifier).toContain("45/2019/QH14");
  });

  test("has og:type=article", async ({ page }) => {
    await page.goto("/luat/bo-luat-lao-dong/2019/dieu-35");
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "article");
  });

  test("has canonical URL", async ({ page }) => {
    await page.goto("/luat/bo-luat-lao-dong/2019/dieu-35");
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      "href",
      "https://lcvn.vn/luat/bo-luat-lao-dong/2019/dieu-35",
    );
  });

  test("info panel toggles on click", async ({ page }) => {
    await page.goto("/luat/bo-luat-lao-dong/2019/dieu-35");
    // Article info panel should be hidden initially (off-screen right)
    const panel = page.locator('aside.fixed.right-0');
    await expect(panel).not.toBeInViewport();
    // Click toggle
    await page.locator('label[for="info-toggle"]').first().click();
    await expect(panel).toBeInViewport();
  });

  test("prev/next article navigation works", async ({ page }) => {
    await page.goto("/luat/bo-luat-lao-dong/2019/dieu-35");
    const nextLink = page.locator("nav a", { hasText: "Điều 36" });
    await expect(nextLink).toBeVisible();
    await nextLink.click();
    await expect(page.locator("h1")).toContainText("Điều 36");
  });

  test("returns 404 for nonexistent article", async ({ page }) => {
    const response = await page.goto("/luat/bo-luat-lao-dong/2019/dieu-999");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Cross-document navigation", () => {
  test("Civil Code article renders correctly", async ({ page }) => {
    await page.goto("/luat/bo-luat-dan-su/2015/dieu-385");
    await expect(page.locator("h1")).toContainText("Điều 385");
    await expect(page.locator("h1")).toContainText("Khái niệm hợp đồng");
  });
});
