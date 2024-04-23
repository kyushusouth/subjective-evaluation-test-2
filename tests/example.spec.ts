/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from "@playwright/test";

const email = "user4@test.com";
const wrongEmail = "user@test.com";
const password = "user4pass";
const wrongPassword = "user";
const age = "48";
const sex = "無回答";
const numSamplesPerPage = 5;
const numTotalSamplesPractice = 10;
const numTotalPagesPractice = numTotalSamplesPractice / numSamplesPerPage;
const numTotalSamples1 = 120;
const numTotalPages1 = numTotalSamples1 / numSamplesPerPage;
const numTotalSamples2 = 120;
const numTotalPages2 = numTotalSamples2 / numSamplesPerPage;

test.describe("login and logout", () => {
  test.beforeEach(
    "visiting the index page at the first time",
    async ({ page }) => {
      await page.goto("/");
      await expect(
        page.getByRole("button", { name: "Open main menu" }),
      ).toBeHidden();
      await expect(page).toHaveURL("/login");
      await expect(
        page.getByRole("button", { name: "Open main menu" }),
      ).toBeHidden();
    },
  );

  test.afterEach("logout", async ({ page }) => {
    await page.getByRole("button", { name: "Open main menu" }).click();
    await page.getByRole("button", { name: "ログアウト" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("success", async ({ page }) => {
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(password);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "実験について" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open main menu" }),
    ).toBeVisible();
  });

  test("success after failed", async ({ page }) => {
    await page.getByLabel("メールアドレス").fill(wrongEmail);
    await page.getByLabel("パスワード").fill(wrongPassword);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/login?message=Failed");
    await expect(page.getByText("認証に失敗しました。")).toBeVisible();
    await expect(
      page.getByText(
        "正しいメールアドレスとパスワードの入力をお願い致します。",
      ),
    ).toBeVisible();

    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(wrongPassword);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/login?message=Failed");
    await expect(page.getByText("認証に失敗しました。")).toBeVisible();
    await expect(
      page.getByText(
        "正しいメールアドレスとパスワードの入力をお願い致します。",
      ),
    ).toBeVisible();

    await page.getByLabel("メールアドレス").fill(wrongEmail);
    await page.getByLabel("パスワード").fill(password);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/login?message=Failed");
    await expect(page.getByText("認証に失敗しました。")).toBeVisible();
    await expect(
      page.getByText(
        "正しいメールアドレスとパスワードの入力をお願い致します。",
      ),
    ).toBeVisible();

    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(password);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "実験について" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open main menu" }),
    ).toBeVisible();
  });
});

test.describe("after login successed", () => {
  test.beforeEach("login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(password);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "実験について" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open main menu" }),
    ).toBeVisible();
  });

  test.afterEach("logout", async ({ page }) => {
    await page.getByRole("button", { name: "Open main menu" }).click();
    await page.getByRole("button", { name: "ログアウト" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("check NavBarDrawer", async ({ page }) => {
    await expect(page.getByRole("link", { name: "HOME" })).not.toHaveClass(
      /pointer-events-none/,
    );
    await expect(
      page.getByRole("link", { name: "性別・年齢" }),
    ).not.toHaveClass(/pointer-events-none/);
    await expect(page.getByRole("link", { name: "練習試行" })).not.toHaveClass(
      /pointer-events-none/,
    );

    await expect(page.getByRole("link", { name: "本番試行1" })).toHaveClass(
      /pointer-events-none/,
    );
    await expect(page.getByRole("link", { name: "本番試行2" })).toHaveClass(
      /pointer-events-none/,
    );
  });

  test("info", async ({ page }) => {
    await page.getByRole("button", { name: "Open main menu" }).click();
    await page.getByRole("link", { name: "性別・年齢" }).click();
    await expect(page).toHaveURL("/info");
    await expect(page.getByRole("button", { name: "提出する" })).toBeDisabled();
    await page.getByLabel("年齢").fill(age);
    await page.getByLabel("性別").selectOption(sex);
    await expect(page.getByRole("button", { name: "提出する" })).toBeEnabled();
    await page.getByRole("button", { name: "提出する" }).click();
    await expect(page).toHaveURL("/thanks");
    await expect(page).toHaveURL("/", { timeout: 5000 });
    await expect(page.getByRole("link", { name: "性別・年齢" })).toHaveClass(
      /pointer-events-none/,
    );
  });

  test.describe("eval_practice and eval_*", () => {
    test("eval_practice 1", async ({ page }) => {
      await page.getByRole("button", { name: "Open main menu" }).click();
      await page.getByRole("link", { name: "練習試行" }).click();
      await expect(page).toHaveURL("/eval_practice");

      const formItemList = await page.getByTestId("formItem");
      for (let pageId = 0; pageId < numTotalPagesPractice; pageId += 1) {
        if (pageId === 0) {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeDisabled();
        } else {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeEnabled();
        }
        await expect(page.getByRole("button", { name: "進む" })).toBeDisabled();

        for (let sampleId = 0; sampleId < numSamplesPerPage; sampleId += 1) {
          const formItem = formItemList.nth(sampleId);
          await formItem.getByTestId("naturalness").selectOption("普通");
          await formItem.getByTestId("intelligibility").selectOption("普通");
        }

        await page.evaluate(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        });
        await expect(page.getByRole("button", { name: "進む" })).toBeEnabled();
        await page.getByRole("button", { name: "進む" }).click();
      }

      await expect(page.getByRole("button", { name: "戻る" })).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "提出する" }),
      ).toBeEnabled();
      await page.getByRole("button", { name: "提出する" }).click();
      await expect(page).toHaveURL("/thanks");
      await expect(page).toHaveURL("/", { timeout: 5000 });
      await expect(
        page.getByRole("link", { name: "練習試行" }),
      ).not.toHaveClass(/pointer-events-none/);
    });

    test("eval_practice 2", async ({ page }) => {
      await page.getByRole("button", { name: "Open main menu" }).click();
      await page.getByRole("link", { name: "練習試行" }).click();
      await expect(page).toHaveURL("/eval_practice");

      const formItemList = await page.getByTestId("formItem");
      for (let pageId = 0; pageId < numTotalPagesPractice; pageId += 1) {
        if (pageId === 0) {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeDisabled();
        } else {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeEnabled();
        }
        await expect(page.getByRole("button", { name: "進む" })).toBeDisabled();

        for (let sampleId = 0; sampleId < numSamplesPerPage; sampleId += 1) {
          const formItem = formItemList.nth(sampleId);
          await formItem.getByTestId("naturalness").selectOption("普通");
          await formItem.getByTestId("intelligibility").selectOption("普通");
        }

        await page.evaluate(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        });
        await expect(page.getByRole("button", { name: "進む" })).toBeEnabled();
        await page.getByRole("button", { name: "進む" }).click();
      }

      await expect(page.getByRole("button", { name: "戻る" })).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "提出する" }),
      ).toBeEnabled();
      await page
        .getByRole("button", { name: "提出する" })
        .click({ timeout: 10000 });
      await expect(page).toHaveURL("/thanks");
      await expect(page).toHaveURL("/", { timeout: 5000 });
      await expect(
        page.getByRole("link", { name: "練習試行" }),
      ).not.toHaveClass(/pointer-events-none/);
    });

    test("eval_1", async ({ page }) => {
      await page.getByRole("button", { name: "Open main menu" }).click();
      await expect(
        page.getByRole("link", { name: "本番試行1" }),
      ).not.toHaveClass(/pointer-events-none/);
      await page.getByRole("link", { name: "本番試行1" }).click();
      await expect(page).toHaveURL("/eval_1");

      const formItemList = await page.getByTestId("formItem");
      for (let pageId = 0; pageId < numTotalPages1; pageId += 1) {
        if (pageId === 0) {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeDisabled();
        } else {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeEnabled();
        }
        await expect(page.getByRole("button", { name: "進む" })).toBeDisabled();

        for (let sampleId = 0; sampleId < numSamplesPerPage; sampleId += 1) {
          const formItem = formItemList.nth(sampleId);
          await formItem.getByTestId("naturalness").selectOption("普通");
          await formItem.getByTestId("intelligibility").selectOption("普通");
        }

        await page.evaluate(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        });
        await expect(page.getByRole("button", { name: "進む" })).toBeEnabled();
        await page.getByRole("button", { name: "進む" }).click();
      }

      await expect(page.getByRole("button", { name: "戻る" })).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "提出する" }),
      ).toBeEnabled();
      await page
        .getByRole("button", { name: "提出する" })
        .click({ timeout: 10000 });
      await expect(page).toHaveURL("/thanks");
      await expect(page).toHaveURL("/", { timeout: 5000 });
      await expect(page.getByRole("link", { name: "本番試行1" })).toHaveClass(
        /pointer-events-none/,
      );
    });

    test("eval_practice 3", async ({ page }) => {
      await page.getByRole("button", { name: "Open main menu" }).click();
      await page.getByRole("link", { name: "練習試行" }).click();
      await expect(page).toHaveURL("/eval_practice");

      const formItemList = await page.getByTestId("formItem");
      for (let pageId = 0; pageId < numTotalPagesPractice; pageId += 1) {
        if (pageId === 0) {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeDisabled();
        } else {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeEnabled();
        }
        await expect(page.getByRole("button", { name: "進む" })).toBeDisabled();

        for (let sampleId = 0; sampleId < numSamplesPerPage; sampleId += 1) {
          const formItem = formItemList.nth(sampleId);
          await formItem.getByTestId("naturalness").selectOption("普通");
          await formItem.getByTestId("intelligibility").selectOption("普通");
        }

        await page.evaluate(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        });
        await expect(page.getByRole("button", { name: "進む" })).toBeEnabled();
        await page.getByRole("button", { name: "進む" }).click();
      }

      await expect(page.getByRole("button", { name: "戻る" })).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "提出する" }),
      ).toBeEnabled();
      await page.getByRole("button", { name: "提出する" }).click();
      await expect(page).toHaveURL("/thanks");
      await expect(page).toHaveURL("/", { timeout: 5000 });
      await expect(
        page.getByRole("link", { name: "練習試行" }),
      ).not.toHaveClass(/pointer-events-none/);
    });

    test("eval_2", async ({ page }) => {
      await page.getByRole("button", { name: "Open main menu" }).click();
      await expect(
        page.getByRole("link", { name: "本番試行2" }),
      ).not.toHaveClass(/pointer-events-none/);
      await page.getByRole("link", { name: "本番試行2" }).click();
      await expect(page).toHaveURL("/eval_2");

      const formItemList = await page.getByTestId("formItem");
      for (let pageId = 0; pageId < numTotalPages2; pageId += 1) {
        if (pageId === 0) {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeDisabled();
        } else {
          await expect(
            page.getByRole("button", { name: "戻る" }),
          ).toBeEnabled();
        }
        await expect(page.getByRole("button", { name: "進む" })).toBeDisabled();

        for (let sampleId = 0; sampleId < numSamplesPerPage; sampleId += 1) {
          const formItem = formItemList.nth(sampleId);
          await formItem.getByTestId("naturalness").selectOption("普通");
          await formItem.getByTestId("intelligibility").selectOption("普通");
        }

        await page.evaluate(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        });
        await expect(page.getByRole("button", { name: "進む" })).toBeEnabled();
        await page.getByRole("button", { name: "進む" }).click();
      }

      await expect(page.getByRole("button", { name: "戻る" })).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "提出する" }),
      ).toBeEnabled();
      await page
        .getByRole("button", { name: "提出する" })
        .click({ timeout: 10000 });
      await expect(page).toHaveURL("/thanks");
      await expect(page).toHaveURL("/", { timeout: 5000 });
      await expect(page.getByRole("link", { name: "本番試行2" })).toHaveClass(
        /pointer-events-none/,
      );
    });
  });
});
