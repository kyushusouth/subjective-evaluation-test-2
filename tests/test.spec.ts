/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import fs from "fs";
import { parse } from "csv-parse/sync";
import { expect, Page, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

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
			is_finished_intnat_practice: false,
			is_finished_intnat_main: false,
			is_finished_sim_practice: false,
			is_finished_sim_main: false,
			is_invalid: false,
		},
	});
}

async function checkAudioPlayable(audio: HTMLAudioElement): Promise<boolean> {
	try {
		await audio.play();
		audio.pause();
		return true;
	} catch (e) {
		return false;
	}
}

async function reliableReload(
	page: Page,
	maxRetries: number = 3,
): Promise<void> {
	for (let i = 0; i < maxRetries; i += 1) {
		try {
			await page.reload({ waitUntil: "load" });
			return;
		} catch (error) {
			const err = error as Error;
			console.warn(`Reload attempt ${i + 1} failed: ${err.message}`);
			if (i === maxRetries - 1) throw err;
			await new Promise((res) => {
				setTimeout(res, 1000);
			});
		}
	}
}

async function reliableGoto(
	page: Page,
	url: string,
	maxRetries: number = 3,
): Promise<void> {
	for (let i = 0; i < maxRetries; i += 1) {
		try {
			await page.goto(url, { waitUntil: "load" });
			return;
		} catch (error) {
			const err = error as Error;
			console.warn(
				`Navigation attempt ${i + 1} to ${url} failed: ${err.message}`,
			);
			if (i === maxRetries - 1) throw err;
			await new Promise((res) => {
				setTimeout(res, 1000);
			});
		}
	}
}

async function checkAccordion(
	page: Page,
	checkList: string[][],
) {
	for (const itemList of checkList) {
		for (const item of itemList) {
			await page.getByRole("button", { name: item }).click();
			await expect(page.getByLabel(item).locator("div"))
				.toBeVisible();
			if (item === "ダミー音声について") {
				const dummySampleIntNatAccordion = await page.getByLabel(
					"ダミー音声について",
				).locator("audio");
				expect(dummySampleIntNatAccordion).not.toBeNull();
				const dummySampleIntNatAccordionIsPlayable =
					await dummySampleIntNatAccordion!
						.evaluate(
							checkAudioPlayable,
						);
				expect(dummySampleIntNatAccordionIsPlayable).toBe(true);
			}
			await page.getByRole("button", { name: item }).click();
			await expect(page.getByLabel(item).locator("div"))
				.not.toBeVisible();
		}
	}
}

async function checkNextPrevButtons(
	page: Page,
	pageId: number,
) {
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
}

const authLocalSavePath = process.env.LOCAL_AUTH_SAVE_PATH;
if (authLocalSavePath === undefined) {
	throw new Error("LOCAL_AUTH_SAVE_PATH was not specified.");
}

const records = parse(fs.readFileSync(authLocalSavePath), {
	columns: true,
	skip_empty_lines: true,
});

for (const record of records.slice(1, 2)) {
	const respondentId = Number(record.respondent_id);
	const { email, password } = record;
	const wrongEmail = "wrong@test.com";
	const wrongPassword = "wrong";
	const age = String(generateRandomInteger(1, 100));
	const sexItemList = ["男性", "女性", "無回答"];
	const sex = sexItemList[generateRandomInteger(0, sexItemList.length - 1)];
	const audioDeviceItemList = ["イヤホン", "ヘッドホン"];
	const audioDevice = audioDeviceItemList[
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
	const similarityItemList = [
		"1: 非常に悪い",
		"2: 悪い",
		"3: 普通",
		"4: 良い",
		"5: 非常に良い",
	];
	const numSamplesPerPage = 5;
	const numTotalSamplesPractice = 8;
	const numTotalPagesPractice = Math.ceil(
		numTotalSamplesPractice / numSamplesPerPage,
	);
	const numTotalSamples1 = 55;
	const numTotalPages1 = Math.ceil(numTotalSamples1 / numSamplesPerPage);

	reset(respondentId);

	test(`${respondentId}: Checking behaviour when not logged in`, async ({ page }) => {
		const pathList: string[] = [
			"/",
			"/login",
			"/info",
			"/intnat_practice",
			"/intnat_practice/exp",
			"/intnat_main",
			"/intnat_main/exp",
			"/sim_practice",
			"/sim_practice/exp",
			"/sim_main",
			"/sim_main/exp",
			"/thanks",
			"/error",
		];
		for (const path of pathList) {
			await reliableGoto(page, path);
			await page.waitForURL("/login");
		}
	});

	test(`${respondentId}: Checking behaviour when too much authentication request`, async ({ page }) => {
		await reliableGoto(page, "/login?message=ExceedLimit");
		await expect(
			page.getByText(
				"サーバーが混み合っており、ログインが困難です。しばらく待ってからの再試行をお願い致します。",
			),
		).toBeVisible();
	});

	test.describe(`${respondentId}: login and logout`, () => {
		test.beforeEach(
			"visiting the index page at the first time",
			async ({ page }) => {
				await reliableGoto(page, "/");
				await page.waitForURL("/login");
				await expect(
					page.getByRole("button", { name: "Open main menu" }),
				).toBeHidden();
			},
		);

		test.afterEach("logout", async ({ page }) => {
			await page.getByRole("button", { name: "Open main menu" }).click();
			await page.getByRole("button", { name: "ログアウト" }).click();
			await page.waitForURL("/login");
		});

		test("success", async ({ page }) => {
			await expect(page.getByLabel("パスワード")).toHaveAttribute(
				"type",
				"password",
			);

			await page.getByLabel("メールアドレス").fill(email);
			await page.getByLabel("パスワード").fill(password);

			await page
				.locator("label")
				.filter({ hasText: "パスワード" })
				.getByRole("button")
				.click();
			await expect(page.getByLabel("パスワード")).toHaveAttribute(
				"type",
				"text",
			);

			await page
				.locator("label")
				.filter({ hasText: "パスワード" })
				.getByRole("button")
				.click();
			await expect(page.getByLabel("パスワード")).toHaveAttribute(
				"type",
				"password",
			);

			await page.getByRole("button", { name: "ログイン" }).click();
			await page.waitForURL("/");
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
			await page.waitForURL("/login?message=Failed");
			await expect(page.getByText("認証に失敗しました。")).toBeVisible();
			await expect(
				page.getByText(
					"正しいメールアドレスとパスワードの入力をお願い致します。",
				),
			).toBeVisible();

			await page.getByLabel("メールアドレス").fill(email);
			await page.getByLabel("パスワード").fill(wrongPassword);
			await page.getByRole("button", { name: "ログイン" }).click();
			await page.waitForURL("/login?message=Failed");
			await expect(page.getByText("認証に失敗しました。")).toBeVisible();
			await expect(
				page.getByText(
					"正しいメールアドレスとパスワードの入力をお願い致します。",
				),
			).toBeVisible();

			await page.getByLabel("メールアドレス").fill(wrongEmail);
			await page.getByLabel("パスワード").fill(password);
			await page.getByRole("button", { name: "ログイン" }).click();
			await page.waitForURL("/login?message=Failed");
			await expect(page.getByText("認証に失敗しました。")).toBeVisible();
			await expect(
				page.getByText(
					"正しいメールアドレスとパスワードの入力をお願い致します。",
				),
			).toBeVisible();

			await page.getByLabel("メールアドレス").fill(email);
			await page.getByLabel("パスワード").fill(password);
			await page.getByRole("button", { name: "ログイン" }).click();
			await page.waitForURL("/");
			await expect(
				page.getByRole("heading", { name: "実験について" }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Open main menu" }),
			).toBeVisible();
		});
	});

	test.describe(`${respondentId}: after login successed`, () => {
		test.beforeEach("login", async ({ page }) => {
			await reliableGoto(page, "/");
			await page.waitForURL("/login");
			await page.getByLabel("メールアドレス").fill(email);
			await page.getByLabel("パスワード").fill(password);
			await page.getByRole("button", { name: "ログイン" }).click();
			await page.waitForURL("/");
		});

		test.afterEach("logout", async ({ page }) => {
			await page.getByRole("button", { name: "Open main menu" }).click();
			await page.getByRole("button", { name: "ログアウト" }).click();
			await page.waitForURL("/login");
		});

		test("check NavBarDrawer", async ({ page }) => {
			await expect(page.getByRole("link", { name: "HOME", exact: true }))
				.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "アンケート", exact: true }),
			).not.toHaveClass(/pointer-events-none/);
			await expect(
				page.getByRole("link", { name: "アンケート", exact: true }),
			).toHaveClass(/text-black hover:text-blue-700 hover:bg-gray-100/);

			await expect(
				page.getByRole("link", {
					name: "練習試行（明瞭性・自然性）",
					exact: true,
				}),
			)
				.toHaveClass(
					/text-black hover:text-blue-700 hover:bg-gray-100/,
				);

			await expect(
				page.getByRole("link", {
					name: "本番試行（明瞭性・自然性）",
					exact: true,
				}),
			)
				.toHaveClass(
					/text-gray-400 pointer-events-none/,
				);

			await expect(
				page.getByRole("link", { name: "練習試行（類似性）", exact: true }),
			)
				.toHaveClass(
					/text-gray-400 pointer-events-none/,
				);

			await expect(
				page.getByRole("link", { name: "本番試行（類似性）", exact: true }),
			)
				.toHaveClass(
					/text-gray-400 pointer-events-none/,
				);
		});

		test("info", async ({ page }) => {
			await page.getByRole("button", { name: "Open main menu" }).click();
			await page.getByRole("link", { name: "アンケート" }).click();
			await page.waitForURL("/info");

			await expect(page.getByRole("link", { name: "HOME", exact: true }))
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "アンケート", exact: true }),
			).toHaveClass(/text-blue-700 bg-gray-100/);

			await expect(
				page.getByRole("link", {
					name: "練習試行（明瞭性・自然性）",
					exact: true,
				}),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", {
					name: "本番試行（明瞭性・自然性）",
					exact: true,
				}),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "練習試行（類似性）", exact: true }),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "本番試行（類似性）", exact: true }),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();

			const infoCheckList = [
				["年齢"],
				["性別"],
				["利用される音響機器"],
				["年齢", "性別"],
				["年齢", "利用される音響機器"],
				["性別", "利用される音響機器"],
				["年齢", "性別", "利用される音響機器"],
			];
			const infoCheckItemMap: { [key: string]: string } = {
				"年齢": age,
				"性別": sex,
				"利用される音響機器": audioDevice,
			};
			for (const infoCheck of infoCheckList) {
				for (const item of infoCheck) {
					if (item === "年齢") {
						await page.getByLabel(item).fill(infoCheckItemMap[item]);
					} else {
						await page.getByLabel(item).selectOption(infoCheckItemMap[item]);
					}
				}
				if (infoCheck.length < 3) {
					await expect(page.getByRole("button", { name: "提出する" }))
						.toBeDisabled();
					await reliableReload(page);
					await expect(page.getByRole("button", { name: "提出する" }))
						.toBeDisabled();
				}
			}

			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeEnabled();
			await page.getByRole("button", { name: "提出する" }).click();

			await page.waitForURL("/thanks");
			await page.waitForURL("/");

			await expect(page.getByRole("link", { name: "HOME", exact: true }))
				.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "アンケート", exact: true }),
			).toHaveClass(/text-gray-400 pointer-events-none/);

			await expect(
				page.getByRole("link", {
					name: "練習試行（明瞭性・自然性）",
					exact: true,
				}),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", {
					name: "本番試行（明瞭性・自然性）",
					exact: true,
				}),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "練習試行（類似性）", exact: true }),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "本番試行（類似性）", exact: true }),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await reliableGoto(page, "info");
			await page.waitForURL("/");
		});

		test.describe("intnat_practice and intnat_main", () => {
			const testConfigList = [
				{
					testName: "intnat_practice_1",
					linkName: "練習試行（明瞭性・自然性）",
					url: "/intnat_practice",
					numTotalPages: numTotalPagesPractice,
					numSampleLastPage: numTotalSamplesPractice %
						numSamplesPerPage,
				},
				{
					testName: "intnat_practice_2",
					linkName: "練習試行（明瞭性・自然性）",
					url: "/intnat_practice",
					numTotalPages: numTotalPagesPractice,
					numSampleLastPage: numTotalSamplesPractice %
						numSamplesPerPage,
				},
				{
					testName: "intnat_main",
					linkName: "本番試行（明瞭性・自然性）",
					url: "/intnat_main",
					numTotalPages: numTotalPages1,
					numSampleLastPage: numTotalSamples1 % numSamplesPerPage,
				},
			];
			// eslint-disable-next-line no-restricted-syntax
			for (const testConfig of testConfigList) {
				test(testConfig.testName, async ({ page }) => {
					await page.getByRole("button", { name: "Open main menu" })
						.click();
					await page.getByRole("link", { name: testConfig.linkName })
						.click();
					await page.waitForURL(testConfig.url);

					const dummySampleIntNatFirst = await page.locator("audio");
					expect(dummySampleIntNatFirst).not.toBeNull();
					const dummySampleIntNatFirstIsPlayable = await dummySampleIntNatFirst!
						.evaluate(
							checkAudioPlayable,
						);
					expect(dummySampleIntNatFirstIsPlayable).toBe(true);

					await expect(
						page.getByRole("link", { name: "HOME", exact: true }),
					)
						.not.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					await expect(
						page.getByRole("link", {
							name: "アンケート",
							exact: true,
						}),
					)
						.not.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					if (testConfig.testName === "intnat_practice_1") {
						await expect(
							page.getByRole("link", {
								name: "練習試行（明瞭性・自然性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-blue-700 bg-gray-100/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行（明瞭性・自然性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);

						await expect(
							page.getByRole("link", {
								name: "練習試行（類似性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行（類似性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);
					} else if (testConfig.linkName === "intnat_practice_2") {
						await expect(
							page.getByRole("link", {
								name: "練習試行（明瞭性・自然性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-blue-700 bg-gray-100/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行（明瞭性・自然性）",
								exact: true,
							}),
						).not
							.toHaveClass(
								/pointer-events-none/,
							);
						await expect(
							page.getByRole("link", {
								name: "本番試行（明瞭性・自然性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-black hover:text-blue-700 hover:bg-gray-100/,
							);

						await expect(
							page.getByRole("link", {
								name: "練習試行（類似性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行（類似性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);
					} else if (testConfig.linkName === "intnat_main") {
						await expect(
							page.getByRole("link", {
								name: "練習試行（明瞭性・自然性）",
								exact: true,
							}),
						)
							.not.toHaveClass(
								/text-blue-700 bg-gray-100/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行（明瞭性・自然性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-blue-700 bg-gray-100/,
							);

						await expect(
							page.getByRole("link", {
								name: "練習試行（類似性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行（類似性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);
					}

					await page
						.getByRole("button", {
							name: "実験を開始する",
						})
						.click();
					await page.waitForURL(`${testConfig.url}/exp`);

					await expect(
						page.getByRole("link", {
							name: testConfig.linkName,
							exact: true,
						}),
					)
						.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					const intnatAccordionCheckList: string[][] = [
						["明瞭性とは"],
						["自然性とは"],
						["ダミー音声について"],
						["明瞭性とは", "自然性とは"],
						["明瞭性とは", "ダミー音声について"],
						["自然性とは", "ダミー音声について"],
						["明瞭性とは", "自然性とは", "ダミー音声について"],
					];
					for (
						let pageId = 0;
						pageId < testConfig.numTotalPages;
						pageId += 1
					) {
						await expect(page.getByLabel("明瞭性とは").locator("div")).not
							.toBeVisible();
						await expect(page.getByLabel("自然性とは").locator("div")).not
							.toBeVisible();
						await expect(page.getByLabel("ダミー音声について").locator("div"))
							.not
							.toBeVisible();
						await checkAccordion(page, intnatAccordionCheckList);
						await checkNextPrevButtons(page, pageId);

						const formItemList = page.getByTestId("formItem");
						for (
							let sampleId = 0;
							sampleId < numSamplesPerPage;
							sampleId += 1
						) {
							if (
								pageId === testConfig.numTotalPages - 1 &&
								testConfig.numSampleLastPage !== 0 &&
								sampleId > testConfig.numSampleLastPage - 1
							) {
								break;
							}

							const sampleIntNat = await page.locator("ul")
								.filter({
									hasText: "明瞭性1: 非常に悪い2: 悪い3: 普通4: 良い5",
								}).locator("audio").nth(sampleId);
							expect(sampleIntNat).not.toBeNull();
							const sampleIntNatIsPlayable = await sampleIntNat!.evaluate(
								checkAudioPlayable,
							);
							expect(sampleIntNatIsPlayable).toBe(true);

							const formItem = formItemList.nth(sampleId);
							const intelligibilityItemIndex = generateRandomInteger(
								0,
								intelligibilityItemList.length - 1,
							);
							const naturalnessItemIndex = generateRandomInteger(
								0,
								naturalnessItemList.length - 1,
							);

							// ラジオボタン
							await formItem
								.locator('input[name^="intelligibility_"]')
								.nth(intelligibilityItemIndex)
								.check();
							await formItem
								.locator('input[name^="naturalness"]')
								.nth(naturalnessItemIndex)
								.check();

							// セレクトボックス
							// await formItem
							//   .getByTestId("intelligibility")
							//   .selectOption(intelligibilityItem);
							// await formItem
							//   .getByTestId("naturalness")
							//   .selectOption(naturalnessItem);
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
						await page.getByRole("button", { name: "進む" })
							.click();
					}

					await expect(page.getByRole("button", { name: "戻る" }))
						.toBeEnabled();
					await expect(
						page.getByRole("button", { name: "提出する" }),
					).toBeEnabled();
					await page.getByRole("button", { name: "提出する" })
						.click();

					await page.waitForURL("/thanks");
					await page.waitForURL("/");

					await expect(
						page.getByRole("link", { name: "HOME", exact: true }),
					)
						.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					await expect(
						page.getByRole("link", {
							name: "アンケート",
							exact: true,
						}),
					)
						.not.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					await expect(
						page.getByRole("link", {
							name: "練習試行（明瞭性・自然性）",
							exact: true,
						}),
					)
						.not.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					if (testConfig.linkName === "本番試行（明瞭性・自然性）") {
						await expect(
							page.getByRole("link", {
								name: "本番試行（明瞭性・自然性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);

						await expect(
							page.getByRole("link", {
								name: "練習試行（類似性）",
								exact: true,
							}),
						)
							.not.toHaveClass(
								/pointer-events-none/,
							);
						await expect(
							page.getByRole("link", {
								name: "練習試行（類似性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-black hover:text-blue-700 hover:bg-gray-100/,
							);
					} else {
						await expect(
							page.getByRole("link", {
								name: "本番試行（明瞭性・自然性）",
								exact: true,
							}),
						).not
							.toHaveClass(
								/pointer-events-none/,
							);
						await expect(
							page.getByRole("link", {
								name: "本番試行（明瞭性・自然性）",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-black hover:text-blue-700 hover:bg-gray-100/,
							);
					}
				});
			}
		});

		test.describe("sim_practice and sim_main", () => {
			const testConfigList = [
				{
					testName: "sim_practice_1",
					linkName: "練習試行（類似性）",
					url: "/sim_practice",
					numTotalPages: numTotalPagesPractice,
					numSampleLastPage: numTotalSamplesPractice %
						numSamplesPerPage,
				},
				{
					testName: "sim_practice_2",
					linkName: "練習試行（類似性）",
					url: "/sim_practice",
					numTotalPages: numTotalPagesPractice,
					numSampleLastPage: numTotalSamplesPractice %
						numSamplesPerPage,
				},
				{
					testName: "sim_main",
					linkName: "本番試行（類似性）",
					url: "/sim_main",
					numTotalPages: numTotalPages1,
					numSampleLastPage: numTotalSamples1 % numSamplesPerPage,
				},
			];
			// eslint-disable-next-line no-restricted-syntax
			for (const testConfig of testConfigList) {
				test(testConfig.testName, async ({ page }) => {
					await page.getByRole("button", { name: "Open main menu" })
						.click();
					await page.getByRole("link", { name: testConfig.linkName })
						.click();
					await page.waitForURL(testConfig.url);

					const dummySampleSimFirst = await page.locator("audio");
					expect(dummySampleSimFirst).not.toBeNull();
					const dummySampleSimFirstIsPlayable = await dummySampleSimFirst!
						.evaluate(
							checkAudioPlayable,
						);
					expect(dummySampleSimFirstIsPlayable).toBe(true);

					await page
						.getByRole("button", {
							name: "実験を開始する",
						})
						.click();
					await page.waitForURL(`${testConfig.url}/exp`);

					await expect(
						page.getByRole("link", {
							name: testConfig.linkName,
							exact: true,
						}),
					)
						.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					const simAccordionCheckList: string[][] = [
						["類似性とは"],
						["ダミー音声について"],
						["類似性とは", "ダミー音声について"],
					];
					for (let pageId = 0; pageId < testConfig.numTotalPages; pageId += 1) {
						await expect(page.getByLabel("類似性とは").locator("div")).not
							.toBeVisible();
						await expect(page.getByLabel("ダミー音声について").locator("div"))
							.not
							.toBeVisible();
						await checkAccordion(page, simAccordionCheckList);
						await checkNextPrevButtons(page, pageId);

						const formItemList = page.getByTestId("formItem");
						for (
							let sampleId = 0;
							sampleId < numSamplesPerPage;
							sampleId += 1
						) {
							if (
								pageId === testConfig.numTotalPages - 1 &&
								testConfig.numSampleLastPage !== 0 &&
								sampleId > testConfig.numSampleLastPage - 1
							) {
								break;
							}
						}
					}
				});
			}
		});
	});
}
