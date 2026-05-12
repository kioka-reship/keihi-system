import { test, expect, request } from "@playwright/test";

const BASE_URL = "https://keihi-system-gamma.vercel.app";

const SUPABASE_URL          = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// TC1〜TC4 で共有するテストアカウント（毎回ユニーク）
const EMAIL    = `test-${Date.now()}@test-keihi.com`;
const PASSWORD = "TestPass123!";

let testUserId = "";

// ─────────────────────────────────────────────
// セットアップ：Supabase Admin API でメール確認済みユーザーを作成
// ─────────────────────────────────────────────
test.beforeAll(async () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が未設定です。" +
      ".env.local を確認してください。"
    );
  }

  const api = await request.newContext();

  // 1. メール確認済みユーザーを作成（signUp の email confirmation をスキップ）
  const createRes = await api.post(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: {
      apikey:        SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    data: {
      email:         EMAIL,
      password:      PASSWORD,
      email_confirm: true,   // メール確認不要
    },
  });

  const created = await createRes.json();
  testUserId = created.id ?? "";

  if (!testUserId) {
    throw new Error(`テストユーザー作成失敗: ${JSON.stringify(created)}`);
  }

  // 2. profiles 行を upsert（DB トリガーが動いていれば上書きなし、失敗時の保険）
  await api.post(`${SUPABASE_URL}/rest/v1/profiles`, {
    headers: {
      apikey:         SUPABASE_SERVICE_KEY,
      Authorization:  `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer:         "resolution=merge-duplicates",
    },
    data: {
      id:            testUserId,
      email:         EMAIL,
      plan:          "none",
      extra_credits: 0,
      monthly_count: 0,
      is_admin:      false,
    },
  });
});

// ─────────────────────────────────────────────
// クリーンアップ：テスト終了後にユーザーを削除
// ─────────────────────────────────────────────
test.afterAll(async () => {
  if (!testUserId) return;

  const api = await request.newContext();
  await api.delete(`${SUPABASE_URL}/auth/v1/admin/users/${testUserId}`, {
    headers: {
      apikey:        SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
});

// ─────────────────────────────────────────────
// TC1: plan=none のユーザーはログイン後 /plans にリダイレクトされる
// （新規登録直後の状態を API で再現し、ミドルウェアの動作を検証）
// ─────────────────────────────────────────────
test("TC1: plan=none のユーザーはログイン後 /plans にリダイレクトされる", async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();

  // plan=none のためミドルウェアが /plans にリダイレクトする
  await expect(page).toHaveURL(`${BASE_URL}/plans`, { timeout: 15000 });
});

// ─────────────────────────────────────────────
// TC2: plan=none のユーザーはダッシュボードに入れない
// ─────────────────────────────────────────────
test("TC2: plan=none のユーザーは / にアクセスすると /plans にリダイレクトされる", async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();

  // セッション確立を待つ（ログイン画面から離れるまで）
  await page.waitForURL(url => !url.includes("/auth/login"), { timeout: 10000 });

  // / を明示的に叩く
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

  await page.getByRole("button", { name: /お試し（無料・月3枚）で始める/ }).click();

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

  await expect(page).toHaveURL(/\/(plans)?$/, { timeout: 15000 });

  await expect(
    page.locator("text=メールアドレスまたはパスワードが間違っています")
  ).not.toBeVisible();
});

// ─────────────────────────────────────────────
// TC5: 未ログインユーザーは /terms・/privacy・/tokushoho にアクセスできる
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
