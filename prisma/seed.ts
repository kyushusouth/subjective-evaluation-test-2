/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-restricted-syntax */
/* eslint-disable object-shorthand */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { Storage } from "@google-cloud/storage";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dfd = require("danfojs-node");

dotenv.config({ path: "../.env" });
const prisma = new PrismaClient();
const storage = new Storage();

function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function getWavFilesInDirectory(directoryPath: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(directoryPath);
  for (const item of items) {
    const itemPath = path.join(directoryPath, item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      files.push(...getWavFilesInDirectory(itemPath));
    } else if (stats.isFile() && itemPath.endsWith(".wav")) {
      files.push(itemPath);
    }
  }
  return files;
}

const makeNewDir = (dirPath: string): void => {
  if (fs.existsSync(dirPath)) {
    fs.rmdirSync(dirPath, { recursive: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
};

const copyFiles = (dirPath: string, srcDestFilePathList: string[][]): void => {
  makeNewDir(dirPath);
  for (const [srcFilePath, destFilePath] of srcDestFilePathList) {
    fs.copyFileSync(srcFilePath, path.join(dirPath, destFilePath));
  }
};

function containsArray(arrays: string[][], array: string[]): boolean {
  return arrays.some(
    (a) =>
      a.length === array.length &&
      a.every((val, index) => val === array[index]),
  );
}

async function main() {
  const localWavDir = process.env.LOCAL_WAV_DIR;
  const localWavDirRandomized = process.env.LOCAL_WAV_DIR_RANDOMIZED;
  const bucketName = process.env.GCS_BUCKET_NAME;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authLocalSavePath = process.env.LOCAL_AUTH_SAVE_PATH;
  const modelNameGt = process.env.MODEL_NAME_GT;
  const modelNameAbsMel = process.env.MODEL_NAME_ABS_MEL;
  const modelNameAbsCatMelHubertEncoder =
    process.env.MODEL_NAME_CAT_MEL_HUBERT_ENCODER;
  const modelNameAbsCatMelHubertCluster =
    process.env.MODEL_NAME_CAT_MEL_HUBERT_CLUSTER;
  const modelNameAbsCatMelHubertEncoderHubertCluster =
    process.env.MODEL_NAME_CAT_MEL_HUBERT_ENCODER_HUBERT_CLUSTER;

  if (localWavDir === undefined) {
    throw new Error("LOCAL_WAV_DIR was not specified.");
  }
  if (localWavDirRandomized === undefined) {
    throw new Error("LOCAL_WAV_DIR_RANDAMIZED was not specified.");
  }
  if (bucketName === undefined) {
    throw new Error("GCS_BUCKET_NAME was not specified.");
  }
  if (supabaseUrl === undefined) {
    throw new Error("SUPABASE_URL was not specified.");
  }
  if (serviceRoleKey === undefined) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY was not specified.");
  }
  if (authLocalSavePath === undefined) {
    throw new Error("LOCAL_AUTH_SAVE_PATH was not specified.");
  }
  if (modelNameGt === undefined) {
    throw new Error("MODEL_NAME_GT was not specified.");
  }
  if (modelNameAbsMel === undefined) {
    throw new Error("MODEL_NAME_ABS_MEL was not specified.");
  }
  if (modelNameAbsCatMelHubertEncoder === undefined) {
    throw new Error("MODEL_NAME_CAT_MEL_HUBERT_ENCODER was not specified.");
  }
  if (modelNameAbsCatMelHubertCluster === undefined) {
    throw new Error("MODEL_NAME_CAT_MEL_HUBERT_CLUSTER was not specified.");
  }
  if (modelNameAbsCatMelHubertEncoderHubertCluster === undefined) {
    throw new Error(
      "MODEL_NAME_CAT_MEL_HUBERT_ENCODER_HUBERT_CLUSTER was not specified.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers();
    if (users.length === 0) {
      break;
    }
    for (const user of users) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  }

  const [gcsFiles] = await storage.bucket(bucketName).getFiles();
  for (const file of gcsFiles) {
    await storage.bucket(bucketName).file(file.name).delete();
  }

  const filePathList = getWavFilesInDirectory(localWavDir);

  const modelNameList: string[] = [];
  const modelNameRule: Record<string, string> = {
    gt: modelNameGt,
    absMel: modelNameAbsMel,
    absCatMelHubertEncoder: modelNameAbsCatMelHubertEncoder,
    absCatMelHubertCluster: modelNameAbsCatMelHubertCluster,
    absCatMelHubertEncoderHubertCluster:
      modelNameAbsCatMelHubertEncoderHubertCluster,
  };
  let sampleNameList: string[] = [];
  for (const filePath of filePathList) {
    const filePathParts = filePath.split("/");
    const modelName = filePathParts[filePathParts.length - 4];
    const sampleName = filePathParts[filePathParts.length - 2];
    for (const [key, value] of Object.entries(modelNameRule)) {
      if (modelName === value && !modelNameList.includes(key)) {
        modelNameList.push(key);
      }
    }
    if (!modelNameList.includes(modelName)) {
      modelNameList.push(modelName);
    }
    if (!sampleNameList.includes(sampleName)) {
      sampleNameList.push(sampleName);
    }
  }

  const sampleGroupSizeList: number[] = [];
  const sampleGroupSizeListIndices: number[] = [];
  for (let i = 0; i < modelNameList.length; i += 1) {
    sampleGroupSizeList.push(
      Math.floor(sampleNameList.length / modelNameList.length),
    );
    sampleGroupSizeListIndices.push(i);
  }
  const remainder = sampleNameList.length % modelNameList.length;
  for (let i = 0; i < remainder; i += 1) {
    const randomIndex = Math.floor(
      Math.random() * sampleGroupSizeListIndices.length,
    );
    sampleGroupSizeList[sampleGroupSizeListIndices[randomIndex]] += 1;
    sampleGroupSizeListIndices.splice(randomIndex, 1);
  }

  sampleNameList = shuffleArray(sampleNameList);
  const sampleGroupMap: Record<string, number> = {};
  const samplePageNameMap: Record<string, string> = {};
  let sampleGroupSizeCumsum = 0;
  for (
    let sampleGroupIndex = 0;
    sampleGroupIndex < sampleGroupSizeList.length;
    sampleGroupIndex += 1
  ) {
    const sampleGroupSize = sampleGroupSizeList[sampleGroupIndex];
    const sampleNameListSliced = sampleNameList.slice(
      sampleGroupSizeCumsum,
      sampleGroupSize + sampleGroupSizeCumsum,
    );
    const practiceIndex = Math.floor(
      Math.random() * sampleNameListSliced.length,
    );
    for (
      let sampleNameIndex = 0;
      sampleNameIndex < sampleNameListSliced.length;
      sampleNameIndex += 1
    ) {
      const sampleName = sampleNameListSliced[sampleNameIndex];
      sampleGroupMap[sampleName] = sampleGroupIndex;
      if (sampleNameIndex === practiceIndex) {
        samplePageNameMap[sampleName] = "eval_practice";
      } else {
        samplePageNameMap[sampleName] = "eval_1";
      }
    }
    sampleGroupSizeCumsum += sampleGroupSize;
  }

  const modelNameKindPairlist: string[][] = [];
  for (const filePath of filePathList) {
    const filePathParts = filePath.split("/");
    const modelName = filePathParts[filePathParts.length - 4];
    const kind = filePathParts[filePathParts.length - 1].split(".")[0];
    if (
      (kind === "gt" && modelName !== modelNameRule.gt) ||
      (kind === "abs" &&
        modelName !== modelNameRule.absMel &&
        modelName !== modelNameRule.absCatMelHubertEncoder &&
        modelName !== modelNameRule.absCatMelHubertCluster &&
        modelName !== modelNameRule.absCatMelHubertEncoderHubertCluster)
    ) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (!containsArray(modelNameKindPairlist, [modelName, kind])) {
      modelNameKindPairlist.push([modelName, kind]);
    }
  }

  const sampleMetaDataList: {
    file_path: string;
    model_name: string;
    model_id: number;
    speaker_name: string;
    sample_name: string;
    sample_group: number;
    sample_page_name: string;
    kind: string;
  }[] = [];
  const srcDestFilePathList: string[][] = [];
  const emailPasswordList: { email: string; password: string }[] = [];

  for (const filePath of filePathList) {
    const filePathParts = filePath.split("/");
    const modelName = filePathParts[filePathParts.length - 4];
    const speakerName = filePathParts[filePathParts.length - 3];
    const sampleName = filePathParts[filePathParts.length - 2];
    const sampleGroup = sampleGroupMap[sampleName];
    const samplePageName = samplePageNameMap[sampleName];
    const kind = filePathParts[filePathParts.length - 1].split(".")[0];
    const randomizedFilePath = `${uuidv4()}.wav`;
    if (
      (kind === "gt" && modelName !== modelNameRule.gt) ||
      (kind === "abs" &&
        modelName !== modelNameRule.absMel &&
        modelName !== modelNameRule.absCatMelHubertEncoder &&
        modelName !== modelNameRule.absCatMelHubertCluster &&
        modelName !== modelNameRule.absCatMelHubertEncoderHubertCluster)
    ) {
      // eslint-disable-next-line no-continue
      continue;
    }
    for (let i = 0; i < modelNameKindPairlist.length; i += 1) {
      if (
        modelNameKindPairlist[i][0] === modelName &&
        modelNameKindPairlist[i][1] === kind
      ) {
        const modelId = i;
        srcDestFilePathList.push([filePath, randomizedFilePath]);
        sampleMetaDataList.push({
          file_path: randomizedFilePath,
          model_name: modelName,
          model_id: modelId,
          speaker_name: speakerName,
          sample_name: sampleName,
          sample_group: sampleGroup,
          sample_page_name: samplePageName,
          kind: kind,
        });
        break;
      }
    }
  }

  let df = new dfd.DataFrame(sampleMetaDataList);
  const nSelectedList = [];
  for (let i = 0; i < sampleMetaDataList.length; i += 1) {
    nSelectedList.push(0);
  }
  df.addColumn("n_selected", nSelectedList, { inplace: true });
  const nSpeaker = df["speaker_name"].nUnique();
  const nModel = df["model_id"].nUnique();
  const nAnsPerSample = 3;
  const nTrial = nSpeaker * nModel * nAnsPerSample;
  const passwordLength = 6;
  const respondentFilePathList: { id: number; file_path_list: string[] }[] = [];

  for (let trial = 0; trial < nTrial; trial += 1) {
    let dfCand;
    if (df["n_selected"].nUnique() === 1) {
      dfCand = df.copy();
    } else {
      const nSelectedMax = df["n_selected"].max();
      dfCand = df.loc({ rows: df["n_selected"].lt(nSelectedMax) }).copy();
    }

    const selectedData: {
      file_path: string[];
      is_selected: number[];
      [key: string]: (string | number)[];
    } = {
      file_path: [],
      is_selected: [],
    };

    dfCand.addColumn(
      "model_assign_id",
      dfCand["sample_group"].add(trial).mod(nModel),
      { inplace: true },
    );
    for (const sampleName of dfCand["sample_name"].unique().values) {
      let dfCandSampled = dfCand
        .loc({
          rows: dfCand["sample_name"]
            .eq(sampleName)
            .and(dfCand["model_id"].eq(dfCand["model_assign_id"])),
        })
        .copy()
        .resetIndex();

      if (dfCandSampled.shape[0] !== dfCandSampled["speaker_name"].nUnique()) {
        throw new Error(
          "The number of rows in the dataframe does not match the number of speakers.",
        );
      }

      const selectIndex = Math.floor(Math.random() * dfCandSampled.shape[0]);
      dfCandSampled = dfCandSampled.iloc({ rows: [selectIndex] });
      selectedData.file_path.push(dfCandSampled["file_path"].values[0]);
      selectedData.is_selected.push(1);
    }

    const { length } = selectedData.file_path;
    const indices = Array.from({ length }, (_, i) => i);
    const indicesShuffled = shuffleArray(indices);
    const selectedDataShuffled = { ...selectedData };
    for (const key of Object.keys(selectedDataShuffled)) {
      selectedDataShuffled[key] = indicesShuffled.map(
        (i) => selectedDataShuffled[key][i],
      );
    }

    const dfSelectedData = new dfd.DataFrame(selectedData);
    for (const col of dfSelectedData.columns) {
      if (
        df.columns.includes(col) &&
        dfSelectedData[col].dtype !== df[col].dtype
      ) {
        dfSelectedData.asType(col, df[col].dtype, { inplace: true });
      }
    }

    df = dfd
      .merge({
        left: df,
        right: dfSelectedData,
        on: ["file_path"],
        how: "left",
      })
      .fillNa([0], { columns: ["is_selected"] });
    df["n_selected"] = df["n_selected"].add(df["is_selected"]);
    df.drop({ columns: ["is_selected"], inplace: true });

    const email = `user${trial}@test.com`;
    const password = generateRandomString(passwordLength);
    await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });
    emailPasswordList.push({
      email: email,
      password: password,
    });
    respondentFilePathList.push({
      id: trial + 1,
      file_path_list: selectedDataShuffled.file_path,
    });
  }

  const dfEmailPassword = new dfd.DataFrame(emailPasswordList);
  dfd.toCSV(dfEmailPassword, {
    filePath: authLocalSavePath,
  });

  for (const respondentFilePath of respondentFilePathList) {
    await prisma.respondents.update({
      where: {
        id: respondentFilePath.id,
      },
      data: {
        file_path_list: respondentFilePath.file_path_list,
      },
    });
  }

  copyFiles(localWavDirRandomized!, srcDestFilePathList);
  execSync(`gsutil -m cp ${localWavDirRandomized}/*.wav gs://${bucketName}`);

  await prisma.sampleMetaData.createMany({
    data: sampleMetaDataList,
    skipDuplicates: true,
  });

  const sexItemList = [{ item: "男性" }, { item: "女性" }, { item: "無回答" }];
  await prisma.sexItem.createMany({
    data: sexItemList,
    skipDuplicates: true,
  });

  const naturalnessItemList = [
    { item: "非常に悪い" },
    { item: "悪い" },
    { item: "普通" },
    { item: "良い" },
    { item: "非常に良い" },
  ];
  await prisma.naturalnessItem.createMany({
    data: naturalnessItemList,
    skipDuplicates: true,
  });

  const intelligibilityItemList = [
    { item: "非常に悪い" },
    { item: "悪い" },
    { item: "普通" },
    { item: "良い" },
    { item: "非常に良い" },
  ];
  await prisma.intelligibilityItem.createMany({
    data: intelligibilityItemList,
    skipDuplicates: true,
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
