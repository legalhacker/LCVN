import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toContainText("GCR Admin");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("invalid login shows error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid email or password")).toBeVisible({
      timeout: 10000,
    });
  });

  test("valid login redirects to dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', "admin@lcvn.vn");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("dashboard shows stats", async ({ page }) => {
    // Login first
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', "admin@lcvn.vn");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });

    // Check stat cards are present
    await expect(page.locator("text=Regulatory Changes")).toBeVisible();
    await expect(page.locator("text=Legal Documents")).toBeVisible();
    await expect(page.locator("text=Fields")).toBeVisible();
    await expect(page.locator("text=Users")).toBeVisible();
  });

  test("unauthenticated user redirects to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/admin/login**", { timeout: 10000 });
  });

  test("regulatory changes list shows data after login", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', "admin@lcvn.vn");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });

    await page.goto("/admin/regulatory-changes");
    await expect(page.locator("h1")).toContainText("Regulatory Changes");
    // Should see the 2 seeded changes
    await expect(page.locator("table tbody tr")).toHaveCount(2, { timeout: 10000 });
  });
});
