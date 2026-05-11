import { test, expect } from "@playwright/test";

const BASE_URL = "https://keihi-system-gamma.vercel.app";

// TC1〜TC4 で共有するテストアカウント
const EMAIL = `test-${Date.now()}@test-keihi.com`;
const PASSWORD = "TestPass123!";
const NAME = "テスト太郎";
const PHONE = "09000000000";

// ─────────────────────────────────────────────
// TC1: 新規登録後に /plans にリダイレクトされる
// ─────────────────────────────────────────────
test("TC1: 新規登録後に /plans にリダイレクトされる", async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/register`);

  // フォームは label と input が for/id 未紐付けのためプレースホルダーで一意選択
  // type="text" が氏名・紹介コードの2フィールドに存在するため placeholder で区別
  await page.getByPlaceholder("山田 太郎").fill(NAME);
  await page.getByPlaceholder("090-0000-0000").fill(PHONE);
  await page.getByPlaceholder("example@email.com").fill(EMAIL);
  await page.locator('input[type="password"]').nth(0).fill(PASSWORD);
  await page.locator('input[type="password"]').nth(1).fill(PASSWORD);

  await page.getByRole("button", { name: "アカウントを作成" }).click();

  // エラーメッセージが出ていた場合は内容を出力（デバッグ用）
  await page.waitForTimeout(3000);
  const errorBox = page.locator('[class*="bg-red-50"]');
  if (await errorBox.isVisible()) {
    console.log("[TC1 ERROR]", await errorBox.textContent());
  }

  // /plans へのリダイレクトを確認（最大20秒）
  await expect(page).toHaveURL(`${BASE_URL}/plans`, { timeout: 20000 });
});

// ─────────────────────────────────────────────
// TC2: plan=none のユーザーはダッシュボードに入れない
// ─────────────────────────────────────────────
test("TC2: plan=none のユーザーは / にアクセスすると /plans にリダイレクトされる", async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();

  // ログイン後に / を明示的に叩く
  await page.goto(`${BASE_URL}/`);
  await expect(page).toHaveURL(`${BASE_URL}/plans`, { timeout: 10000 });
});

// ─────────────────────────────────────────────
// TC3: /plans でお試しボタンをクリックするとダッシュボードに入れる
// ─────────────────────────────────────────────
test("TC3: /plans でお試しボタンをクリックするとダッシュボードに遷移する", async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(`${BASE_URL}/plans`, { timeout: 10000 });

  // お試しボタンをクリック
  await page.getByRole("button", { name: /お試し（無料・月3枚）で始める/ }).click();

  // ダッシュボード（/）への遷移を確認
  await expect(page).toHaveURL(`${BASE_URL}/`, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible({
    timeout: 10000,
  });
});

// ─────────────────────────────────────────────
// TC4: 登録したメール・パスワードでログインできる
// ─────────────────────────────────────────────
test("TC4: 登録済みメール・パスワードでログインできる", async ({ page }) => {
  // TC3 でお試しに切り替わっているのでダッシュボードに入れるはず
  await page.goto(`${BASE_URL}/auth/login`);
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();

  // ダッシュボード または /plans に遷移（エラーにならないこと）
  await expect(page).toHaveURL(/\/(plans)?$/, { timeout: 15000 });

  // エラーメッセージが出ていないことを確認
  await expect(
    page.locator("text=メールアドレスまたはパスワードが間違っています")
  ).not.toBeVisible();
});

// ─────────────────────────────────────────────
// TC5: 未ログインユーザーは /terms・/privacy・/tokushoho にアクセスできる
// 【注意】middleware.ts の修正（publicPaths 追加）を本番にデプロイ後にパスする
// ─────────────────────────────────────────────
test("TC5: 未ログインでも /terms にアクセスできる", async ({ page }) => {
  await page.goto(`${BASE_URL}/terms`);
  await expect(page).not.toHaveURL(/auth\/login/, { timeout: 8000 });
  await expect(page.getByRole("heading", { name: "利用規約" })).toBeVisible();
});

test("TC5: 未ログインでも /privacy にアクセスできる", async ({ page }) => {
  await page.goto(`${BASE_URL}/privacy`);
  await expect(page).not.toHaveURL(/auth\/login/, { timeout: 8000 });
  await expect(page.locator("h1")).toBeVisible();
});

test("TC5: 未ログインでも /tokushoho にアクセスできる", async ({ page }) => {
  await page.goto(`${BASE_URL}/tokushoho`);
  await expect(page).not.toHaveURL(/auth\/login/, { timeout: 8000 });
  await expect(page.locator("h1")).toBeVisible();
});
