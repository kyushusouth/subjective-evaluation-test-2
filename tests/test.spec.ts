/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import fs from "fs";
import { parse } from "csv-parse/sync";
import { expect, Locator, Page, test } from "@playwright/test";
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

async function isAudioPlayable(audio: HTMLAudioElement): Promise<boolean> {
	try {
		await audio.play();
		audio.pause();
		return true;
	} catch (e) {
		return false;
	}
}

async function checkIsAudioPlayable(
	audio: Locator,
) {
	expect(audio).not.toBeNull();
	const locatorIsPlayable = await audio.evaluate(
		isAudioPlayable,
	);
	expect(locatorIsPlayable).toBe(true);
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

async function navBarDrawerCurrentPage(
	page: Page,
	linkName: string,
) {
	await expect(page.getByRole("link", { name: linkName, exact: true }))
		.toHaveClass(
			/text-blue-700 bg-gray-100/,
		);
}

async function navBarDrawerIsSelectable(
	page: Page,
	linkName: string,
) {
	await expect(
		page.getByRole("link", { name: linkName, exact: true }),
	).not.toHaveClass(/pointer-events-none/);
	await expect(
		page.getByRole("link", { name: linkName, exact: true }),
	).toHaveClass(/text-black hover:text-blue-700 hover:bg-gray-100/);
}

async function navBarDrawerIsNotSelectable(
	page: Page,
	linkName: string,
) {
	await expect(
		page.getByRole("link", { name: linkName, exact: true }),
	).toHaveClass(/text-gray-400 pointer-events-none/);
}

function getCombinations<T>(elements: T[]): T[][] {
	const result: T[][] = [[]];
	for (const element of elements) {
		const currentLength = result.length;
		for (let i = 0; i < currentLength; i += 1) {
			const combination = result[i].concat(element);
			result.push(combination);
		}
	}
	return result;
}

async function checkAccordion(
	page: Page,
	checkListAll: string[],
) {
	const checkListCombinations = getCombinations(checkListAll);
	for (const checkList of checkListCombinations) {
		if (checkList.length === 0) {
			for (const item of checkListAll) {
				await expect(page.getByLabel(item).locator("div")).not.toBeVisible();
			}
		} else {
			for (const item of checkList) {
				await page.getByRole("button", { name: item }).click();
				await expect(page.getByLabel(item).locator("div"))
					.toBeVisible();
				if (item === "ダミー音声について") {
					const dummySampleIntNatAccordion = await page.getByLabel(
						"ダミー音声について",
					).locator("audio");
					await checkIsAudioPlayable(dummySampleIntNatAccordion);
				}
				await page.getByRole("button", { name: item }).click();
				await expect(page.getByLabel(item).locator("div"))
					.not.toBeVisible();
			}
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

async function checkFormItem(
	formItemList: Locator,
	sampleId: number,
	itemList: string[],
	itemName: string,
) {
	const formItem = formItemList.nth(sampleId);
	const checkIndex = generateRandomInteger(
		0,
		itemList.length - 1,
	);
	await formItem
		.locator(`input[name^="${itemName}_"]`)
		.nth(checkIndex)
		.check();
}

async function formPageScrollAndGoNext(
	page: Page,
) {
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

async function formCheckSubmit(
	page: Page,
) {
	await expect(page.getByRole("button", { name: "戻る" }))
		.toBeEnabled();
	await expect(
		page.getByRole("button", { name: "提出する" }),
	).toBeEnabled();
	await page.getByRole("button", { name: "提出する" })
		.click();
	await page.waitForURL("/thanks");
	await page.waitForURL("/");
}

async function checkForm(
	page: Page,
	testConfig: {
		testName: string;
		linkName: string;
		url: string;
		numTotalPages: number;
		numSampleLastPage: number;
	},
	numSamplesPerPage: number,
	accordionList: string[],
	numAudioSamplesPerFormItem: number,
	answerItemsList: { [key: string]: string[] },
) {
	await page
		.getByRole("button", {
			name: "実験を開始する",
		})
		.click();
	await page.waitForURL(`${testConfig.url}/exp`);
	await navBarDrawerCurrentPage(page, testConfig.linkName);

	for (
		let pageId = 0;
		pageId < testConfig.numTotalPages;
		pageId += 1
	) {
		await checkAccordion(page, accordionList);
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

			for (
				let audioId = 0;
				audioId < numAudioSamplesPerFormItem;
				audioId += 1
			) {
				const sampleIntNat = await page.locator(
					`li:nth-child(${sampleId + 1}) > audio:nth-child(${audioId + 1})`,
				);
				await checkIsAudioPlayable(sampleIntNat);
			}

			for (
				const [answerName, answerItems] of Object.entries(answerItemsList)
			) {
				await checkFormItem(
					formItemList,
					sampleId,
					answerItems,
					answerName,
				);
			}
		}

		await formPageScrollAndGoNext(page);
	}

	await formCheckSubmit(page);
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
			const wrongEmailPasswordList = [
				[email, wrongPassword],
				[wrongEmail, password],
				[wrongEmail, wrongPassword],
			];
			for (const [m, p] of wrongEmailPasswordList) {
				await page.getByLabel("メールアドレス").fill(m);
				await page.getByLabel("パスワード").fill(p);
				await page.getByRole("button", { name: "ログイン" }).click();
				await page.waitForURL("/login?message=Failed");
				await expect(page.getByText("認証に失敗しました。")).toBeVisible();
				await expect(
					page.getByText(
						"正しいメールアドレスとパスワードの入力をお願い致します。",
					),
				).toBeVisible();
			}
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
			await navBarDrawerCurrentPage(page, "HOME");
			await navBarDrawerIsSelectable(page, "アンケート");
			await navBarDrawerIsSelectable(page, "練習試行（明瞭性・自然性）");
			await navBarDrawerIsNotSelectable(page, "本番試行（明瞭性・自然性）");
			await navBarDrawerIsNotSelectable(page, "練習試行（類似性）");
			await navBarDrawerIsNotSelectable(page, "本番試行（類似性）");
		});

		test("info", async ({ page }) => {
			await page.getByRole("button", { name: "Open main menu" }).click();
			await page.getByRole("link", { name: "アンケート" }).click();
			await page.waitForURL("/info");

			await navBarDrawerIsSelectable(page, "HOME");
			await navBarDrawerCurrentPage(page, "アンケート");

			const infoCheckList = getCombinations([
				"年齢",
				"性別",
				"利用される音響機器",
			]);
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

			await navBarDrawerCurrentPage(page, "HOME");
			await navBarDrawerIsNotSelectable(page, "アンケート");

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

					await navBarDrawerIsSelectable(page, "HOME");
					if (testConfig.linkName === "練習試行（明瞭性・自然性）") {
						await navBarDrawerCurrentPage(page, "練習試行（明瞭性・自然性）");
						if (testConfig.testName === "intnat_practice_1") {
							await navBarDrawerIsNotSelectable(
								page,
								"本番試行（明瞭性・自然性）",
							);
						} else {
							await navBarDrawerIsSelectable(
								page,
								"本番試行（明瞭性・自然性）",
							);
						}
					} else if (testConfig.linkName === "本番試行（明瞭性・自然性）") {
						await navBarDrawerIsSelectable(page, "練習試行（明瞭性・自然性）");
						await navBarDrawerCurrentPage(page, "本番試行（明瞭性・自然性）");
					}
					await navBarDrawerIsNotSelectable(page, "練習試行（類似性）");
					await navBarDrawerIsNotSelectable(page, "本番試行（類似性）");

					const dummySampleIntNatFirst = await page.locator("audio");
					await checkIsAudioPlayable(dummySampleIntNatFirst);

					await checkForm(
						page,
						testConfig,
						numSamplesPerPage,
						["明瞭性とは", "自然性とは", "ダミー音声について"],
						1,
						{
							"intelligibility": intelligibilityItemList,
							"naturalness": naturalnessItemList,
						},
					);

					await navBarDrawerCurrentPage(page, "HOME");
					await navBarDrawerIsSelectable(page, "練習試行（明瞭性・自然性）");
					if (testConfig.linkName === "本番試行（明瞭性・自然性）") {
						await navBarDrawerIsNotSelectable(
							page,
							"本番試行（明瞭性・自然性）",
						);
						await navBarDrawerIsSelectable(page, "練習試行（類似性）");
					} else {
						await navBarDrawerIsSelectable(page, "本番試行（明瞭性・自然性）");
						await navBarDrawerIsNotSelectable(page, "練習試行（類似性）");
					}
					await navBarDrawerIsNotSelectable(page, "本番試行（類似性）");
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

					await navBarDrawerIsSelectable(page, "HOME");
					await navBarDrawerIsSelectable(page, "練習試行（明瞭性・自然性）");
					await navBarDrawerIsNotSelectable(page, "本番試行（明瞭性・自然性）");
					if (testConfig.linkName === "練習試行（類似性）") {
						await navBarDrawerCurrentPage(page, "練習試行（類似性）");
						if (testConfig.testName === "sim_practice_1") {
							await navBarDrawerIsNotSelectable(page, "本番試行（類似性）");
						} else {
							await navBarDrawerIsSelectable(page, "本番試行（類似性）");
						}
					} else if (testConfig.linkName === "本番試行（類似性）") {
						await navBarDrawerIsSelectable(page, "練習試行（類似性）");
						await navBarDrawerCurrentPage(page, "本番試行（類似性）");
					}

					const dummySampleSimFirst = await page.locator("audio");
					await checkIsAudioPlayable(dummySampleSimFirst);

					await checkForm(
						page,
						testConfig,
						numSamplesPerPage,
						["類似性とは", "ダミー音声について"],
						2,
						{
							"similarity": similarityItemList,
						},
					);

					await navBarDrawerCurrentPage(page, "HOME");
					await navBarDrawerIsSelectable(page, "練習試行（明瞭性・自然性）");
					await navBarDrawerIsNotSelectable(page, "本番試行（明瞭性・自然性）");
					await navBarDrawerIsSelectable(page, "練習試行（類似性）");
					if (testConfig.linkName === "本番試行（類似性）") {
						await navBarDrawerIsNotSelectable(page, "本番試行（類似性）");
					} else {
						await navBarDrawerIsSelectable(page, "本番試行（類似性）");
					}
				});
			}
		});
	});
}
