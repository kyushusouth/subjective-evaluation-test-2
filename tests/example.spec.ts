/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

function generateRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * max + 1) + min;
}

const respondentid = 2;
const email = `user${respondentid}@test.com`;
const wrongEmail = "user@test.com";
const password = `user${respondentid}pass`;
const wrongPassword = "user";
const age = String(generateRandomInteger(1, 100));
const sexItemList = ["男性", "女性", "無回答"];
const sex = sexItemList[generateRandomInteger(0, sexItemList.length - 1)];
const naturalnessItemList = [
  "非常に悪い",
  "悪い",
  "普通",
  "良い",
  "非常に良い",
];
const intelligibilityItemList = [
  "非常に悪い",
  "悪い",
  "普通",
  "良い",
  "非常に良い",
];
const numSamplesPerPage = 5;
const numTotalSamplesPractice = 10;
const numTotalPagesPractice = numTotalSamplesPractice / numSamplesPerPage;
const numTotalSamples1 = 120;
const numTotalPages1 = numTotalSamples1 / numSamplesPerPage;
const numTotalSamples2 = 120;
const numTotalPages2 = numTotalSamples2 / numSamplesPerPage;

async function reset() {
  const prisma = new PrismaClient();
  await prisma.respondents.update({
    where: {
      id: respondentid,
    },
    data: {
      age: -1,
      sex: "無回答",
      is_finished_info: false,
      is_finished_practice: false,
      is_finished_eval_1: false,
      is_finished_eval_2: false,
    },
  });
}
reset();

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
    const testConfigList = [
      {
        testName: "eval_practice_1",
        linkName: "練習試行",
        url: "/eval_practice",
        numTotalPages: numTotalPagesPractice,
      },
      {
        testName: "eval_practice_2",
        linkName: "練習試行",
        url: "/eval_practice",
        numTotalPages: numTotalPagesPractice,
      },
      {
        testName: "eval_1",
        linkName: "本番試行1",
        url: "/eval_1",
        numTotalPages: numTotalPages1,
      },
      {
        testName: "eval_practice_3",
        linkName: "練習試行",
        url: "/eval_practice",
        numTotalPages: numTotalPagesPractice,
      },
      {
        testName: "eval_2",
        linkName: "本番試行2",
        url: "/eval_2",
        numTotalPages: numTotalPages2,
      },
    ];
    // eslint-disable-next-line no-restricted-syntax
    for (const testConfig of testConfigList) {
      test(testConfig.testName, async ({ page }) => {
        await page.getByRole("button", { name: "Open main menu" }).click();
        await page.getByRole("link", { name: testConfig.linkName }).click();
        await expect(page).toHaveURL(testConfig.url);

        for (let pageId = 0; pageId < testConfig.numTotalPages; pageId += 1) {
          if (pageId === 0) {
            await expect(
              page.getByRole("button", { name: "戻る" }),
            ).toBeDisabled();
          } else {
            await expect(
              page.getByRole("button", { name: "戻る" }),
            ).toBeEnabled();
          }
          await expect(
            page.getByRole("button", { name: "進む" }),
          ).toBeDisabled();

          const formItemList = page.getByTestId("formItem");
          for (let sampleId = 0; sampleId < numSamplesPerPage; sampleId += 1) {
            const formItem = formItemList.nth(sampleId);
            const naturalnessItem =
              naturalnessItemList[
                generateRandomInteger(0, naturalnessItemList.length - 1)
              ];
            const intelligibilityItem =
              intelligibilityItemList[
                generateRandomInteger(0, intelligibilityItemList.length - 1)
              ];
            await formItem
              .getByTestId("naturalness")
              .selectOption(naturalnessItem);
            await formItem
              .getByTestId("intelligibility")
              .selectOption(intelligibilityItem);
          }

          await page.evaluate(() => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          });
          await expect(
            page.getByRole("button", { name: "進む" }),
          ).toBeEnabled();
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

        if (testConfig.linkName.startsWith("本番試行")) {
          await expect(
            page.getByRole("link", { name: testConfig.linkName }),
          ).toHaveClass(/pointer-events-none/);
        } else {
          await expect(
            page.getByRole("link", { name: testConfig.linkName }),
          ).not.toHaveClass(/pointer-events-none/);
        }
      });
    }
  });
});
