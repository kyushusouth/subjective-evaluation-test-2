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
			is_finished_practice: false,
			is_finished_eval_1: false,
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

const authLocalSavePath = process.env.LOCAL_AUTH_SAVE_PATH;
if (authLocalSavePath === undefined) {
	throw new Error("LOCAL_AUTH_SAVE_PATH was not specified.");
}

const records = parse(fs.readFileSync(authLocalSavePath), {
	columns: true,
	skip_empty_lines: true,
});

for (const record of records.slice(0, 1)) {
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
	const numSamplesPerPage = 5;
	const numTotalSamplesPractice = 10;
	const numTotalPagesPractice = Math.ceil(
		numTotalSamplesPractice / numSamplesPerPage,
	);
	const numTotalSamples1 = 46;
	const numTotalPages1 = Math.ceil(numTotalSamples1 / numSamplesPerPage);

	reset(respondentId);

	test(`${respondentId}: Checking behaviour when not logged in`, async ({ page }) => {
		const pathList: string[] = [
			"/",
			"/error",
			"/eval_1",
			"/eval_1/exp",
			"/eval_practice",
			"/eval_practice/exp",
			"/info",
			"/login",
			"/thanks",
		];
		for (const path of pathList) {
			// await page.goto(path);
			await reliableGoto(page, path);
			await page.waitForURL("/login");
			await expect(page).toHaveURL("/login");
		}
	});

	test(`${respondentId}: Checking behaviour when too much authentication request`, async ({ page }) => {
		// await page.goto("/login?message=ExceedLimit");
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
				// await page.goto("/");
				await reliableGoto(page, "/");
				await page.waitForURL("/login");
				await expect(page).toHaveURL("/login");
				await expect(
					page.getByRole("button", { name: "Open main menu" }),
				).toBeHidden();
			},
		);

		test.afterEach("logout", async ({ page }) => {
			await page.getByRole("button", { name: "Open main menu" }).click();
			await page.getByRole("button", { name: "ログアウト" }).click();
			await page.waitForURL("/login");
			await expect(page).toHaveURL("/login");
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
			await page.waitForURL("/login?message=Failed");
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
			await page.waitForURL("/login?message=Failed");
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
			await page.waitForURL("/login?message=Failed");
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
			await page.waitForURL("/");
			await expect(page).toHaveURL("/");
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
			// await page.goto("/");
			await reliableGoto(page, "/");
			await page.waitForURL("/login");
			await expect(page).toHaveURL("/login");
			await page.getByLabel("メールアドレス").fill(email);
			await page.getByLabel("パスワード").fill(password);
			await page.getByRole("button", { name: "ログイン" }).click();
			await page.waitForURL("/");
			await expect(page).toHaveURL("/");
		});

		test.afterEach("logout", async ({ page }) => {
			await page.getByRole("button", { name: "Open main menu" }).click();
			await page.getByRole("button", { name: "ログアウト" }).click();
			await page.waitForURL("/login");
			await expect(page).toHaveURL("/login");
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
				page.getByRole("link", { name: "練習試行", exact: true }),
			)
				.toHaveClass(
					/text-black hover:text-blue-700 hover:bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "本番試行", exact: true }),
			)
				.toHaveClass(
					/text-gray-400 pointer-events-none/,
				);
		});

		test("info", async ({ page }) => {
			await page.getByRole("button", { name: "Open main menu" }).click();
			await page.getByRole("link", { name: "アンケート" }).click();
			await page.waitForURL("/info");
			await expect(page).toHaveURL("/info");

			await expect(page.getByRole("link", { name: "HOME", exact: true }))
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "アンケート", exact: true }),
			).toHaveClass(/text-blue-700 bg-gray-100/);

			await expect(
				page.getByRole("link", { name: "練習試行", exact: true }),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "本番試行", exact: true }),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();

			await page.getByLabel("年齢").fill(age);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();
			await reliableReload(page);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();

			await page.getByLabel("性別").selectOption(sex);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();
			await reliableReload(page);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();

			await page.getByLabel("利用される音響機器").selectOption(
				audioDevice,
			);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();
			await reliableReload(page);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();

			await page.getByLabel("年齢").fill(age);
			await page.getByLabel("性別").selectOption(sex);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();
			await reliableReload(page);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();

			await page.getByLabel("年齢").fill(age);
			await page.getByLabel("利用される音響機器").selectOption(
				audioDevice,
			);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();
			await reliableReload(page);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();

			await page.getByLabel("性別").selectOption(sex);
			await page.getByLabel("利用される音響機器").selectOption(
				audioDevice,
			);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();
			await reliableReload(page);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeDisabled();

			await page.getByLabel("年齢").fill(age);
			await page.getByLabel("性別").selectOption(sex);
			await page.getByLabel("利用される音響機器").selectOption(
				audioDevice,
			);
			await expect(page.getByRole("button", { name: "提出する" }))
				.toBeEnabled();
			await page.getByRole("button", { name: "提出する" }).click();

			await page.waitForURL("/thanks");
			await expect(page).toHaveURL("/thanks");
			await page.waitForURL("/");
			await expect(page).toHaveURL("/");

			await expect(page.getByRole("link", { name: "HOME", exact: true }))
				.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "アンケート", exact: true }),
			).toHaveClass(/text-gray-400 pointer-events-none/);

			await expect(
				page.getByRole("link", { name: "練習試行", exact: true }),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			await expect(
				page.getByRole("link", { name: "本番試行", exact: true }),
			)
				.not.toHaveClass(
					/text-blue-700 bg-gray-100/,
				);

			// await page.goto("/info");
			await reliableGoto(page, "info");
			await page.waitForURL("/");
			await expect(page).toHaveURL("/");
		});

		test.describe("eval_practice and eval_1", () => {
			const testConfigList = [
				{
					testName: "eval_practice_1",
					linkName: "練習試行",
					url: "/eval_practice",
					numTotalPages: numTotalPagesPractice,
					numSampleLastPage: numTotalSamplesPractice %
						numSamplesPerPage,
				},
				{
					testName: "eval_practice_2",
					linkName: "練習試行",
					url: "/eval_practice",
					numTotalPages: numTotalPagesPractice,
					numSampleLastPage: numTotalSamplesPractice %
						numSamplesPerPage,
				},
				{
					testName: "eval_1",
					linkName: "本番試行",
					url: "/eval_1",
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
					await expect(page).toHaveURL(testConfig.url);

					const audioHandleExample1 = await page.locator("audio");
					expect(audioHandleExample1).not.toBeNull();
					const isPlayableExample1 = await audioHandleExample1!
						.evaluate(
							checkAudioPlayable,
						);
					expect(isPlayableExample1).toBe(true);

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

					if (testConfig.testName === "eval_practice_1") {
						await expect(
							page.getByRole("link", {
								name: "練習試行",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-blue-700 bg-gray-100/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);
					} else if (testConfig.linkName === "eval_practice_2") {
						await expect(
							page.getByRole("link", {
								name: "練習試行",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-blue-700 bg-gray-100/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行",
								exact: true,
							}),
						).not
							.toHaveClass(
								/pointer-events-none/,
							);
						await expect(
							page.getByRole("link", {
								name: "本番試行",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-black hover:text-blue-700 hover:bg-gray-100/,
							);
					} else if (testConfig.linkName === "eval_1") {
						await expect(
							page.getByRole("link", {
								name: "練習試行",
								exact: true,
							}),
						)
							.not.toHaveClass(
								/text-blue-700 bg-gray-100/,
							);

						await expect(
							page.getByRole("link", {
								name: "本番試行",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-blue-700 bg-gray-100/,
							);
					}

					await page
						.getByRole("button", {
							name: `${testConfig.linkName}を開始`,
						})
						.click();
					await expect(page).toHaveURL(`${testConfig.url}/exp`);

					await expect(
						page.getByRole("link", {
							name: testConfig.linkName,
							exact: true,
						}),
					)
						.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					for (
						let pageId = 0;
						pageId < testConfig.numTotalPages;
						pageId += 1
					) {
						// 初めは全て閉じている
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.not.toBeVisible();

						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.not.toBeVisible();

						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.not.toBeVisible();

						// 明瞭性
						await page.getByRole("button", { name: "明瞭性とは？" })
							.click();
						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.toBeVisible();

						await page.getByRole("button", { name: "明瞭性とは？" })
							.click();
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.not.toBeVisible();

						// 自然性
						await page.getByRole("button", { name: "自然性とは？" })
							.click();
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.toBeVisible();

						await page.getByRole("button", { name: "自然性とは？" })
							.click();
						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.not.toBeVisible();

						// ダミー
						await page.getByRole("button", {
							name: "ダミー音声について",
						})
							.click();
						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.toBeVisible();

						const audioHandleExample2 = await page.getByLabel(
							"ダミー音声について",
						).locator("audio");
						expect(audioHandleExample2).not.toBeNull();
						const isPlayableExample2 = await audioHandleExample2!
							.evaluate(
								checkAudioPlayable,
							);
						expect(isPlayableExample2).toBe(true);

						await page.getByRole("button", {
							name: "ダミー音声について",
						})
							.click();
						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.not.toBeVisible();

						// 明瞭性と自然性
						await page.getByRole("button", { name: "明瞭性とは？" })
							.click();
						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.toBeVisible();

						await page.getByRole("button", { name: "自然性とは？" })
							.click();
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.toBeVisible();

						await page.getByRole("button", { name: "明瞭性とは？" })
							.click();
						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.not.toBeVisible();

						await page.getByRole("button", { name: "自然性とは？" })
							.click();
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.not.toBeVisible();

						// 明瞭性とダミー
						await page.getByRole("button", { name: "明瞭性とは？" })
							.click();
						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.toBeVisible();

						await page.getByRole("button", {
							name: "ダミー音声について",
						})
							.click();
						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.toBeVisible();

						const audioHandleExample3 = await page.getByLabel(
							"ダミー音声について",
						).locator("audio");
						expect(audioHandleExample3).not.toBeNull();
						const isPlayableExample3 = await audioHandleExample3!
							.evaluate(
								checkAudioPlayable,
							);
						expect(isPlayableExample3).toBe(true);

						await page.getByRole("button", { name: "明瞭性とは？" })
							.click();
						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.not.toBeVisible();

						await page.getByRole("button", {
							name: "ダミー音声について",
						})
							.click();
						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.not.toBeVisible();

						// 自然性とダミー
						await page.getByRole("button", { name: "自然性とは？" })
							.click();
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.toBeVisible();

						await page.getByRole("button", {
							name: "ダミー音声について",
						})
							.click();
						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.toBeVisible();

						const audioHandleExample4 = await page.getByLabel(
							"ダミー音声について",
						).locator("audio");
						expect(audioHandleExample4).not.toBeNull();
						const isPlayableExample4 = await audioHandleExample4!
							.evaluate(
								checkAudioPlayable,
							);
						expect(isPlayableExample4).toBe(true);

						await page.getByRole("button", { name: "自然性とは？" })
							.click();
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.not.toBeVisible();

						await page.getByRole("button", {
							name: "ダミー音声について",
						})
							.click();
						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.not.toBeVisible();

						// 明瞭性と自然性とダミー
						await page.getByRole("button", { name: "明瞭性とは？" })
							.click();
						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.toBeVisible();

						await page.getByRole("button", { name: "自然性とは？" })
							.click();
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.toBeVisible();

						await page.getByRole("button", {
							name: "ダミー音声について",
						})
							.click();
						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.toBeVisible();

						const audioHandleExample5 = await page.getByLabel(
							"ダミー音声について",
						).locator("audio");
						expect(audioHandleExample5).not.toBeNull();
						const isPlayableExample5 = await audioHandleExample5!
							.evaluate(
								checkAudioPlayable,
							);
						expect(isPlayableExample5).toBe(true);

						await page.getByRole("button", { name: "明瞭性とは？" })
							.click();
						await expect(
							page.getByText(
								"一つ目の評価項目である明瞭性は、発話内容自体がどれくらい聞き取りやすかったかを指します。この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています",
							),
						)
							.not.toBeVisible();

						await page.getByRole("button", { name: "自然性とは？" })
							.click();
						await expect(
							page.getByText(
								"二つ目の評価項目である自然性は、発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたかを指します。例えば、音質自体やイントネーションの自然さなど",
							),
						)
							.not.toBeVisible();

						await page.getByRole("button", {
							name: "ダミー音声について",
						})
							.click();
						await expect(
							page.getByText(
								"音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してく",
							),
						)
							.not.toBeVisible();

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

							const audioHandleExample6 = await page.locator("ul")
								.filter({
									hasText: "明瞭性1: 非常に悪い2: 悪い3: 普通4: 良い5",
								}).locator("audio").nth(sampleId);
							expect(audioHandleExample6).not.toBeNull();
							const isPlayableExample6 = await audioHandleExample6!.evaluate(
								checkAudioPlayable,
							);
							expect(isPlayableExample6).toBe(true);

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
					await expect(page).toHaveURL("/thanks");
					await page.waitForURL("/");
					await expect(page).toHaveURL("/");

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
							name: "練習試行",
							exact: true,
						}),
					)
						.not.toHaveClass(
							/text-blue-700 bg-gray-100/,
						);

					if (testConfig.linkName.startsWith("本番試行")) {
						await expect(
							page.getByRole("link", {
								name: "本番試行",
								exact: true,
							}),
						)
							.toHaveClass(
								/text-gray-400 pointer-events-none/,
							);
					} else {
						await expect(
							page.getByRole("link", {
								name: "本番試行",
								exact: true,
							}),
						).not
							.toHaveClass(
								/pointer-events-none/,
							);
						await expect(
							page.getByRole("link", {
								name: "本番試行",
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
	});
}
