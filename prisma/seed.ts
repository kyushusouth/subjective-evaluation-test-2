// /* eslint-disable no-await-in-loop */
// /* eslint-disable @typescript-eslint/dot-notation */
// /* eslint-disable no-restricted-syntax */
// /* eslint-disable object-shorthand */
// import { PrismaClient } from "@prisma/client";
// import { createClient } from "@supabase/supabase-js";
// import fs from "fs";
// import path from "path";
// import { execSync } from "child_process";
// import { v4 as uuidv4 } from "uuid";
// import { Storage } from "@google-cloud/storage";

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const dfd = require("danfojs-node");

// const prisma = new PrismaClient();
// const storage = new Storage();

// function generateRandomString(length: number): string {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let result = "";
//   for (let i = 0; i < length; i += 1) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     result += characters.charAt(randomIndex);
//   }
//   return result;
// }

// function shuffleArray<T>(array: T[]): T[] {
//   const shuffledArray = array.slice();
//   for (let i = shuffledArray.length - 1; i > 0; i -= 1) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
//   }
//   return shuffledArray;
// }

// function getWavFilesInDirectory(directoryPath: string): string[] {
//   const files: string[] = [];
//   const items = fs.readdirSync(directoryPath);
//   for (const item of items) {
//     const itemPath = path.join(directoryPath, item);
//     const stats = fs.statSync(itemPath);
//     if (stats.isDirectory()) {
//       files.push(...getWavFilesInDirectory(itemPath));
//     } else if (stats.isFile() && itemPath.endsWith(".wav")) {
//       files.push(itemPath);
//     }
//   }
//   return files;
// }

// const makeNewDir = (dirPath: string): void => {
//   if (fs.existsSync(dirPath)) {
//     fs.rmdirSync(dirPath, { recursive: true });
//   }
//   fs.mkdirSync(dirPath, { recursive: true });
// };

// const copyFiles = (dirPath: string, srcDestFilePathList: string[][]): void => {
//   makeNewDir(dirPath);
//   for (const [srcFilePath, destFilePath] of srcDestFilePathList) {
//     fs.copyFileSync(srcFilePath, path.join(dirPath, destFilePath));
//   }
// };

// /**
//  * Extracts model names and sample names from a list of file paths based on a given rule.
//  *
//  * @param filePathList - An array of file paths to process.
//  * @param modelNameRule - A mapping of model names to their corresponding rules.
//  * @returns An object containing two arrays: modelNameList and sampleNameList.
//  */
// function getModelNameAndSampleNameList(
//   filePathList: string[],
//   modelNameRule: Record<string, string>,
// ): { modelNameList: string[]; sampleNameList: string[] } {
//   const modelNameSet: Set<string> = new Set();
//   const sampleNameSet: Set<string> = new Set();

//   for (const filePath of filePathList) {
//     const filePathParts = filePath.split("/");
//     const modelName = filePathParts[filePathParts.length - 4];
//     const sampleName = filePathParts[filePathParts.length - 2];

//     for (const [key, value] of Object.entries(modelNameRule)) {
//       if (modelName === value) {
//         modelNameSet.add(key);
//       }
//     }

//     modelNameSet.add(modelName);
//     sampleNameSet.add(sampleName);
//   }

//   return {
//     modelNameList: Array.from(modelNameSet),
//     sampleNameList: Array.from(sampleNameSet),
//   };
// }

// /**
//  * Divides the sampleNameList into groups based on the modelNameList,
//  * returning the number of samples in each group.
//  *
//  * @param modelNameList - An array of model names.
//  * @param sampleNameList - An array of sample names.
//  * @returns An array of numbers representing the size of each sample group.
//  */
// function getSampleGroupSizeList(
//   modelNameList: string[],
//   sampleNameList: string[],
// ): number[] {
//   const modelCount = modelNameList.length;
//   const sampleCount = sampleNameList.length;
//   const baseSize = Math.floor(sampleCount / modelCount);
//   const remainder = sampleCount % modelCount;

//   const sampleGroupSizeList = Array(modelCount).fill(baseSize);

//   for (let i = 0; i < remainder; i += 1) {
//     sampleGroupSizeList[i] += 1;
//   }

//   return sampleGroupSizeList;
// }

// /**
//  * Assigns samples to groups and maps them to page names.
//  *
//  * @param sampleNameList - An array of sample names.
//  * @param sampleGroupSizeList - An array of group sizes.
//  * @returns An object containing the sample group map and sample page name map.
//  */
// function assignSampleGroups(
//   sampleNameList: string[],
//   sampleGroupSizeList: number[],
// ): {
//   sampleGroupMap: Record<string, number>;
//   samplePageNameMap: Record<string, string>;
// } {
//   // sampleNameListのtestとvalをそれぞれ入れる
//   // sampleGroupMapはtestとvalそれぞれに作る
//   // samplePageNameMapは一つで、testはeval_1、valはeval_practiceとするだけで良い。
//   // samplePageNameMapを作ることなく、testデータを入力とすれば本番試行のデータ、valデータを入力とすれば練習試行のデータを取得できるように作れるといいのかも

//   const sampleNameListShuffled = shuffleArray(sampleNameList);
//   const sampleGroupMap: Record<string, number> = {};
//   const samplePageNameMap: Record<string, string> = {};
//   let cumulativeSize = 0;

//   for (
//     let groupIndex = 0;
//     groupIndex < sampleGroupSizeList.length;
//     groupIndex += 1
//   ) {
//     const groupSize = sampleGroupSizeList[groupIndex];
//     const groupSamples = sampleNameListShuffled.slice(
//       cumulativeSize,
//       cumulativeSize + groupSize,
//     );
//     const practiceIndex = Math.floor(Math.random() * groupSamples.length);

//     groupSamples.forEach((sampleName, index) => {
//       sampleGroupMap[sampleName] = groupIndex;
//       samplePageNameMap[sampleName] = index === practiceIndex
//         ? "eval_practice"
//         : "eval_1";
//     });

//     cumulativeSize += groupSize;
//   }

//   return { sampleGroupMap, samplePageNameMap };
// }

// /**
//  * Checks if a 2D array contains a specific sub-array.
//  *
//  * @param arrays - The 2D array to check.
//  * @param array - The sub-array to search for.
//  * @returns True if the sub-array is found, otherwise false.
//  */
// function containsArray(arrays: string[][], array: string[]): boolean {
//   return arrays.some(
//     (a) =>
//       a.length === array.length &&
//       a.every((val, index) => val === array[index]),
//   );
// }

// /**
//  * Extracts unique model name and kind pairs from file paths based on a given rule.
//  *
//  * @param filePathList - An array of file paths to process.
//  * @param modelNameRule - A mapping of model names to their corresponding rules.
//  * @returns An array of unique model name and kind pairs.
//  */
// function getModelNameKindPairs(
//   filePathList: string[],
//   modelNameRule: Record<string, string>,
// ): string[][] {
//   const modelNameKindPairs: string[][] = [];

//   filePathList.forEach((filePath) => {
//     const filePathParts = filePath.split("/");
//     const modelName = filePathParts[filePathParts.length - 4];
//     const kind = filePathParts[filePathParts.length - 1].split(".")[0];

//     // Skip if the kind and modelName do not match the rules
//     if (
//       (kind === "gt" && modelName !== modelNameRule.gt) ||
//       (kind === "abs_mel_speech_ssl" && modelName !== modelNameRule.absMel)
//     ) {
//       return;
//     }

//     // Add unique modelName and kind pair
//     if (!containsArray(modelNameKindPairs, [modelName, kind])) {
//       modelNameKindPairs.push([modelName, kind]);
//     }
//   });

//   return modelNameKindPairs;
// }

// /**
//  * Extracts metadata and file path mappings from a list of file paths.
//  *
//  * @param filePathList - An array of file paths to process.
//  * @param sampleGroupMap - A mapping of sample names to group indices.
//  * @param samplePageNameMap - A mapping of sample names to page names.
//  * @param modelNameRule - A mapping of model names to their corresponding rules.
//  * @param modelNameKindPairlist - A list of model name and kind pairs.
//  * @returns An object containing sample metadata and source-destination file path mappings.
//  */
// function generateSampleMetaData(
//   filePathList: string[],
//   sampleGroupMap: Record<string, number>,
//   samplePageNameMap: Record<string, string>,
//   modelNameRule: Record<string, string>,
//   modelNameKindPairlist: string[][],
// ): {
//   sampleMetaDataList: {
//     file_path: string;
//     model_name: string;
//     model_id: number;
//     speaker_name: string;
//     sample_name: string;
//     sample_group: number;
//     sample_page_name: string;
//     kind: string;
//     is_dummy: boolean;
//     naturalness_dummy_correct_answer_id: number;
//     intelligibility_dummy_correct_answer_id: number;
//   }[];
//   srcDestFilePathList: string[][];
// } {
//   const sampleMetaDataList: {
//     file_path: string;
//     model_name: string;
//     model_id: number;
//     speaker_name: string;
//     sample_name: string;
//     sample_group: number;
//     sample_page_name: string;
//     kind: string;
//     is_dummy: boolean;
//     naturalness_dummy_correct_answer_id: number;
//     intelligibility_dummy_correct_answer_id: number;
//   }[] = [];

//   const srcDestFilePathList: string[][] = [];

//   filePathList.forEach((filePath) => {
//     const filePathParts = filePath.split("/");
//     const modelName = filePathParts[filePathParts.length - 4];
//     const speakerName = filePathParts[filePathParts.length - 3];
//     const sampleName = filePathParts[filePathParts.length - 2];
//     const sampleGroup = sampleGroupMap[sampleName];
//     const samplePageName = samplePageNameMap[sampleName];
//     const kind = filePathParts[filePathParts.length - 1].split(".")[0];
//     const randomizedFilePath = `${uuidv4()}.wav`;

//     // Skip if the model name and kind do not match the rules
//     if (
//       (kind === "gt" && modelName !== modelNameRule.gt) ||
//       (kind === "abs_mel_speech_ssl" && modelName !== modelNameRule.absMel)
//     ) {
//       return; // Continue to the next file path
//     }

//     // Find the model ID based on the model name and kind pair
//     const modelId = modelNameKindPairlist.findIndex(
//       (pair) => pair[0] === modelName && pair[1] === kind,
//     );

//     if (modelId === -1) {
//       return; // Continue to the next file path if no matching pair is found
//     }

//     srcDestFilePathList.push([filePath, randomizedFilePath]);

//     sampleMetaDataList.push({
//       file_path: randomizedFilePath,
//       model_name: modelName,
//       model_id: modelId,
//       speaker_name: speakerName,
//       sample_name: sampleName,
//       sample_group: sampleGroup,
//       sample_page_name: samplePageName,
//       kind: kind,
//       is_dummy: false,
//       naturalness_dummy_correct_answer_id: 1,
//       intelligibility_dummy_correct_answer_id: 1,
//     });
//   });

//   return { sampleMetaDataList, srcDestFilePathList };
// }

// async function main() {
//   const localWavDirTest = process.env.LOCAL_WAV_DIR_TEST;
//   const localWavDirVal = process.env.LOCAL_WAV_DIR_VAL;
//   const localWavDirDummy = process.env.LOCAL_WAV_DIR_DUMMY;
//   const localWavDirRandomized = process.env.LOCAL_WAV_DIR_RANDOMIZED;
//   const bucketName = process.env.GCS_BUCKET_NAME;
//   const supabaseUrl = process.env.SUPABASE_URL_DEV;
//   const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
//   const authLocalSavePath = process.env.LOCAL_AUTH_SAVE_PATH;
//   const modelNameGt = process.env.MODEL_NAME_GT;
//   const modelNameAbsMel = process.env.MODEL_NAME_ABS_MEL;

//   if (localWavDirTest === undefined) {
//     throw new Error("LOCAL_WAV_DIR_TEST was not specified.");
//   }
//   if (localWavDirVal === undefined) {
//     throw new Error("LOCAL_WAV_DIR_VAL was not specified.");
//   }
//   if (localWavDirDummy === undefined) {
//     throw new Error("LOCAL_WAV_DIR_DUMMY was not specified.");
//   }
//   if (localWavDirRandomized === undefined) {
//     throw new Error("LOCAL_WAV_DIR_RANDAMIZED was not specified.");
//   }
//   if (bucketName === undefined) {
//     throw new Error("GCS_BUCKET_NAME was not specified.");
//   }
//   if (supabaseUrl === undefined) {
//     throw new Error("SUPABASE_URL_DEV was not specified.");
//   }
//   if (serviceRoleKey === undefined) {
//     throw new Error("SUPABASE_SERVICE_ROLE_KEY_DEV was not specified.");
//   }
//   if (authLocalSavePath === undefined) {
//     throw new Error("LOCAL_AUTH_SAVE_PATH was not specified.");
//   }
//   if (modelNameGt === undefined) {
//     throw new Error("MODEL_NAME_GT was not specified.");
//   }
//   if (modelNameAbsMel === undefined) {
//     throw new Error("MODEL_NAME_ABS_MEL was not specified.");
//   }

//   const supabase = createClient(supabaseUrl, serviceRoleKey, {
//     auth: {
//       autoRefreshToken: false,
//       persistSession: false,
//     },
//   });

//   // eslint-disable-next-line no-constant-condition
//   while (true) {
//     const {
//       data: { users },
//       error: listUserError,
//     } = await supabase.auth.admin.listUsers();

//     if (listUserError) {
//       console.error(`listUserError: ${listUserError}`);
//       process.exit(1);
//     }

//     if (users.length === 0) {
//       break;
//     }

//     for (const user of users) {
//       const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
//         user.id,
//       );

//       if (deleteUserError) {
//         console.error(`deleteUserError: ${deleteUserError}`);
//         process.exit(1);
//       }
//     }
//   }

//   const [gcsFiles] = await storage.bucket(bucketName).getFiles();
//   for (const file of gcsFiles) {
//     await storage.bucket(bucketName).file(file.name).delete();
//   }

//   const filePathListTest = getWavFilesInDirectory(localWavDirTest);
//   const filePathListVal = getWavFilesInDirectory(localWavDirVal);

//   // これ以降でテストデータを用いた本番試行用のコードと、検証データを用いた練習試行用のコードを分けられるかも

//   const modelNameRule: Record<string, string> = {
//     gt: modelNameGt,
//     absMel: modelNameAbsMel,
//   };

//   // samplNameListをtestとvalで別々に作る
//   const { modelNameList, sampleNameList } = getModelNameAndSampleNameList(
//     filePathList,
//     modelNameRule,
//   );

//   const sampleGroupSizeList = getSampleGroupSizeList(
//     modelNameList,
//     sampleNameList,
//   );

//   // testとvalを分けるなら、samplePageNameMapがいらないかも
//   const { sampleGroupMap, samplePageNameMap } = assignSampleGroups(
//     sampleNameList,
//     sampleGroupSizeList,
//   );

//   const modelNameKindPairlist = getModelNameKindPairs(
//     filePathList,
//     modelNameRule,
//   );

//   const { sampleMetaDataList, srcDestFilePathList } = generateSampleMetaData(
//     filePathList,
//     sampleGroupMap,
//     samplePageNameMap,
//     modelNameRule,
//     modelNameKindPairlist,
//   );

//   // ここまではわけても問題なさそう

//   let df = new dfd.DataFrame(sampleMetaDataList);

//   df.addColumn("n_selected", Array(sampleMetaDataList.length).fill(0), {
//     inplace: true,
//   });

//   const nSpeaker = df["speaker_name"].nUnique();
//   const nModel = df["model_id"].nUnique();
//   const nAnsPerSample = 5;
//   const nTrial = nSpeaker * nModel * nAnsPerSample;
//   const passwordLength = 6;

//   const respondentFilePathList: { id: number; file_path_list: string[] }[] = [];
//   const authList: { respondent_id: number; email: string; password: string }[] =
//     [];

//   for (let trial = 0; trial < nTrial; trial += 1) {
//     const dfCand = df["n_selected"].nUnique() === 1
//       ? df.copy()
//       : df.loc({ rows: df["n_selected"].lt(df["n_selected"].max()) }).copy();

//     dfCand.addColumn(
//       "model_assign_id",
//       dfCand["sample_group"].add(trial).mod(nModel),
//       { inplace: true },
//     );

//     const selectedData: {
//       file_path: string[];
//       is_selected: number[];
//       [key: string]: (string | number)[];
//     } = {
//       file_path: [],
//       is_selected: [],
//     };

//     for (const sampleName of dfCand["sample_name"].unique().values) {
//       let dfCandSampled = dfCand
//         .loc({
//           rows: dfCand["sample_name"]
//             .eq(sampleName)
//             .and(dfCand["model_id"].eq(dfCand["model_assign_id"])),
//         })
//         .copy()
//         .resetIndex();

//       if (dfCandSampled.shape[0] !== dfCandSampled["speaker_name"].nUnique()) {
//         throw new Error(
//           "The number of rows in the dataframe does not match the number of speakers.",
//         );
//       }

//       const selectIndex = Math.floor(Math.random() * dfCandSampled.shape[0]);
//       dfCandSampled = dfCandSampled.iloc({ rows: [selectIndex] });

//       selectedData.file_path.push(dfCandSampled["file_path"].values[0]);
//       selectedData.is_selected.push(1);
//     }

//     const dfSelectedData = new dfd.DataFrame(selectedData);
//     for (const col of dfSelectedData.columns) {
//       if (
//         df.columns.includes(col) &&
//         dfSelectedData[col].dtype !== df[col].dtype
//       ) {
//         dfSelectedData.asType(col, df[col].dtype, { inplace: true });
//       }
//     }

//     df = dfd
//       .merge({
//         left: df,
//         right: dfSelectedData,
//         on: ["file_path"],
//         how: "left",
//       })
//       .fillNa([0], { columns: ["is_selected"] });

//     df["n_selected"] = df["n_selected"].add(df["is_selected"]);
//     df.drop({ columns: ["is_selected"], inplace: true });

//     // ここからのユーザーの認証情報の処理は、本番試行と練習試行で統一する必要があるのでどちらかで一回だけ。
//     const email = `user${trial}@test.com`;
//     const password = generateRandomString(passwordLength);

//     const { error: createUserError } = await supabase
//       .auth.admin.createUser({
//         email: email,
//         password: password,
//         email_confirm: true,
//       });
//     if (createUserError) {
//       console.error(`createUserError: ${createUserError}`);
//     }

//     authList.push({
//       respondent_id: trial + 1,
//       email: email,
//       password: password,
//     });
//     // ここまで

//     respondentFilePathList.push({
//       id: trial + 1,
//       file_path_list: selectedData.file_path,
//     });
//   }

//   if (
//     df["n_selected"].unique().values.length !== 1 ||
//     df["n_selected"].unique().values[0] !== nAnsPerSample
//   ) {
//     throw new Error(
//       `Each sample must be selected the number of times specified by nAnsPerSample.
//       df["n_selected"].unique().values.length = ${
//         df["n_selected"].unique().values.length
//       }
//       df["n_selected"].unique().values.length[0] = ${
//         df["n_selected"].unique().values[0]
//       }`,
//     );
//   }

//   // ここまでの処理をテストデータと検証データで分け、テストデータで本番試行データ、検証データで練習試行データの割り振りを決定。
//   // ユーザーの認証情報は、本番試行においてのみ作成する。そのための条件分岐が必要。
//   // 関数として実装し、上記のdataframeを返すイメージ。
//   // 現状のバックエンドに合わせるため、本番試行用dataframeと練習試行用dataframeを最後に統合。
//   // 話者類似度テスト用のサンプル割り振りを実装する必要あり。明瞭性・自然性テストを踏襲しながら、合成音声あるいは分析合成と原音声のペアを取得するように実装する。

//   const dfAuth = new dfd.DataFrame(authList);
//   dfd.toCSV(dfAuth, {
//     filePath: authLocalSavePath,
//   });

//   for (const respondentFilePath of respondentFilePathList) {
//     await prisma.respondents.update({
//       where: {
//         id: respondentFilePath.id,
//       },
//       data: {
//         file_path_list: respondentFilePath.file_path_list,
//       },
//     });
//   }

//   const filePathDummyList = getWavFilesInDirectory(localWavDirDummy);

//   for (const filePath of filePathDummyList) {
//     const filePathParts = filePath.split("/");
//     const intellibilityId = Number(
//       filePathParts[filePathParts.length - 1].split(".")[0].split("_")[0],
//     );
//     const naturalnessId = Number(
//       filePathParts[filePathParts.length - 1].split(".")[0].split("_")[1],
//     );
//     const samplePageName = filePathParts[filePathParts.length - 2];
//     const randomizedFilePath = `${uuidv4()}.wav`;

//     srcDestFilePathList.push([filePath, randomizedFilePath]);
//     sampleMetaDataList.push({
//       file_path: randomizedFilePath,
//       model_name: "dummy",
//       model_id: -1,
//       speaker_name: "dummy",
//       sample_name: "dummy",
//       sample_group: -1,
//       sample_page_name: samplePageName,
//       kind: "dummy",
//       is_dummy: true,
//       naturalness_dummy_correct_answer_id: naturalnessId,
//       intelligibility_dummy_correct_answer_id: intellibilityId,
//     });
//   }

//   copyFiles(localWavDirRandomized!, srcDestFilePathList);
//   execSync(`gsutil -m cp ${localWavDirRandomized}/*.wav gs://${bucketName}`);

//   const sexItemList = [{ item: "男性" }, { item: "女性" }, { item: "無回答" }];
//   await prisma.sexItem.createMany({
//     data: sexItemList,
//     skipDuplicates: true,
//   });

//   const audioDeviceList = [{ item: "ヘッドホン" }, { item: "イヤホン" }];
//   await prisma.audioDeviceItem.createMany({
//     data: audioDeviceList,
//     skipDuplicates: true,
//   });

//   const naturalnessItemList = [
//     { item: "非常に悪い" },
//     { item: "悪い" },
//     { item: "普通" },
//     { item: "良い" },
//     { item: "非常に良い" },
//   ];
//   await prisma.naturalnessItem.createMany({
//     data: naturalnessItemList,
//     skipDuplicates: true,
//   });

//   const intelligibilityItemList = [
//     { item: "非常に悪い" },
//     { item: "悪い" },
//     { item: "普通" },
//     { item: "良い" },
//     { item: "非常に良い" },
//   ];
//   await prisma.intelligibilityItem.createMany({
//     data: intelligibilityItemList,
//     skipDuplicates: true,
//   });

//   await prisma.sampleMetaData.createMany({
//     data: sampleMetaDataList,
//     skipDuplicates: true,
//   });
// }

// main()
//   .catch(async (e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
