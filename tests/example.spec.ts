/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from "@playwright/test";

test.beforeEach(
  "Visiting the index page at the first time.",
  async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  },
);

test("login failed", async ({ page }) => {
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("/login");

  await page.getByLabel("メールアドレス").fill("user1@test.com");
  await page.getByLabel("パスワード").fill("user1");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("/login");
  await expect(page.getByText("認証に失敗しました。")).toBeVisible();
  await expect(
    page.getByText("正しいメールアドレスとパスワードの入力をお願い致します。"),
  ).toBeVisible();
});

test("login successed", async ({ page }) => {
  await page.getByLabel("メールアドレス").fill("user1@test.com");
  await page.getByLabel("パスワード").fill("user1pass");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { name: "実験について" }),
  ).toBeVisible();
});
