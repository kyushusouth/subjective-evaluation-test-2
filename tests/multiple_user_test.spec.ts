/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dfd = require("danfojs-node");

function generateRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * max + 1) + min;
}

async function reset(respondentId: number) {
  const prisma = new PrismaClient();
  await prisma.respondents.update({
    where: {
      id: respondentId,
    },
    data: {
      age: -1,
      sex: "無回答",
      audio_device: "無回答",
      is_finished_info: false,
      is_finished_practice: false,
      is_finished_eval_1: false,
      is_invalid: false,
    },
  });
}

test("multiple user test", async ({ page }) => {
  const df = await dfd.readCSV(
    "/Users/minami/dev/nextjs/subjective-evaluation-test-2/auth.csv",
  );
  for (let rowIndex = 106; rowIndex < df.shape[0]; rowIndex += 1) {
    const row = df.iloc({ rows: [rowIndex] });
    const respondentId = rowIndex + 1;
    const email = row.loc({ columns: ["email"] }).values[0][0];
    const password = row.loc({ columns: ["password"] }).values[0][0];
    const age = String(generateRandomInteger(1, 100));
    const sexItemList = ["男性", "女性", "無回答"];
    const sex = sexItemList[generateRandomInteger(0, sexItemList.length - 1)];
    const audioDeviceItemList = ["イヤホン", "ヘッドホン"];
    const audioDevice =
      audioDeviceItemList[
        generateRandomInteger(0, audioDeviceItemList.length - 1)
      ];
    const naturalnessItemList = [
      "1: 非常に悪い",
      "2: 悪い",
      "3: 普通",
      "4: 良い",
      "5: 非常に良い",
    ];
    const intelligibilityItemList = [
      "1: 非常に悪い",
      "2: 悪い",
      "3: 普通",
      "4: 良い",
      "5: 非常に良い",
    ];
    const numSamplesPerPage = 5;
    const numTotalSamplesPractice = 12;
    const numTotalPagesPractice = Math.ceil(
      numTotalSamplesPractice / numSamplesPerPage,
    );
    const numTotalSamples1 = 43;
    const numTotalPages1 = Math.ceil(numTotalSamples1 / numSamplesPerPage);

    reset(respondentId);

    await page.goto("/");
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(password);
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page.getByRole("link", { name: "HOME" })).not.toHaveClass(
      /pointer-events-none/,
    );
    await expect(
      page.getByRole("link", { name: "アンケート" }),
    ).not.toHaveClass(/pointer-events-none/);
    await expect(page.getByRole("link", { name: "練習試行" })).not.toHaveClass(
      /pointer-events-none/,
    );
    await expect(page.getByRole("link", { name: "本番試行" })).toHaveClass(
      /pointer-events-none/,
    );

    await page.getByRole("button", { name: "Open main menu" }).click();
    await page.getByRole("link", { name: "アンケート" }).click();
    await expect(page).toHaveURL("/info");
    await expect(page.getByRole("button", { name: "提出する" })).toBeDisabled();
    await page.getByLabel("年齢").fill(age);
    await page.getByLabel("性別").selectOption(sex);
    await page.getByLabel("利用される音響機器").selectOption(audioDevice);
    await expect(page.getByRole("button", { name: "提出する" })).toBeEnabled();
    await page.getByRole("button", { name: "提出する" }).click();
    await expect(page).toHaveURL("/thanks");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "アンケート" })).toHaveClass(
      /pointer-events-none/,
    );

    const testConfigList = [
      {
        testName: "eval_practice_1",
        linkName: "練習試行",
        url: "/eval_practice",
        numTotalPages: numTotalPagesPractice,
        numSampleLastPage: numTotalSamplesPractice % numSamplesPerPage,
      },
      {
        testName: "eval_1",
        linkName: "本番試行",
        url: "/eval_1",
        numTotalPages: numTotalPages1,
        numSampleLastPage: numTotalSamples1 % numSamplesPerPage,
      },
    ];
    for (const testConfig of testConfigList) {
      await page.getByRole("button", { name: "Open main menu" }).click();
      await page.getByRole("link", { name: testConfig.linkName }).click();
      await expect(page).toHaveURL(testConfig.url);
      await page
        .getByRole("button", { name: `${testConfig.linkName}を開始` })
        .click();
      await expect(page).toHaveURL(`${testConfig.url}/exp`);

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
        await expect(page.getByRole("button", { name: "進む" })).toBeDisabled();

        const formItemList = page.getByTestId("formItem");
        for (let sampleId = 0; sampleId < numSamplesPerPage; sampleId += 1) {
          if (
            pageId === testConfig.numTotalPages - 1 &&
            testConfig.numSampleLastPage !== 0 &&
            sampleId > testConfig.numSampleLastPage - 1
          ) {
            break;
          }

          const formItem = formItemList.nth(sampleId);
          const intelligibilityItemIndex = generateRandomInteger(
            0,
            intelligibilityItemList.length - 1,
          );
          const naturalnessItemIndex = generateRandomInteger(
            0,
            naturalnessItemList.length - 1,
          );

          await formItem
            .locator('input[name^="intelligibility_"]')
            .nth(intelligibilityItemIndex)
            .check();
          await formItem
            .locator('input[name^="naturalness"]')
            .nth(naturalnessItemIndex)
            .check();
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
      // await expect(page).toHaveURL("/thanks");
      await expect(page).toHaveURL("/");

      if (testConfig.linkName.startsWith("本番試行")) {
        await expect(
          page.getByRole("link", { name: testConfig.linkName }),
        ).toHaveClass(/pointer-events-none/);
      } else {
        await expect(
          page.getByRole("link", { name: testConfig.linkName }),
        ).not.toHaveClass(/pointer-events-none/);
      }
    }

    await page.getByRole("button", { name: "Open main menu" }).click();
    await page.getByRole("button", { name: "ログアウト" }).click();
  }
});
