/* eslint-disable no-restricted-syntax */
/* eslint-disable object-shorthand */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { Storage } from "@google-cloud/storage";

dotenv.config({ path: "../.env" });
const prisma = new PrismaClient();
const storage = new Storage();

interface SampleMetaData {
  file_path: string;
  model_name: string;
  speaker_name: string;
  sample_name: string;
  sample_group: number;
  sample_page_name: string;
  kind: string;
  n_selected: number;
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

async function listFiles(bucketName: string) {
  const [files] = await storage.bucket(bucketName).getFiles();
  return files;
}

async function deleteFile(bucketName: string, fileName: string) {
  await storage.bucket(bucketName).file(fileName).delete();
}

async function main() {
  const localWavDir = process.env.LOCAL_WAV_DIR;
  const localWavDirRandomized = process.env.LOCAL_WAV_DIR_RANDOMIZED;
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (localWavDir === undefined) {
    throw new Error("LOCAL_WAV_DIR was not specified.");
  }
  if (bucketName === undefined) {
    throw new Error("GCS_BUCKET_NAME was not specified.");
  }

  const gcsFiles = await listFiles(bucketName);
  for (const file of gcsFiles) {
    deleteFile(bucketName, file.name);
  }

  const filePathList = getWavFilesInDirectory(localWavDir);

  const modelNameList: string[] = [];
  const modelNameRule: Record<string, string> = {
    gt: "20240513_173406",
    absMel: "20240513_173406",
    absCatMelHubertEncoder: "20240513_193648",
    absCatMelHubertCluster: "20240513_213901",
    absCatMelHubertEncoderHubertCluster: "20240514_183036",
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

  const sampleMetaDataList: SampleMetaData[] = [];
  const srcDestFilePathList: string[][] = [];
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
    srcDestFilePathList.push([filePath, randomizedFilePath]);
    sampleMetaDataList.push({
      file_path: randomizedFilePath,
      model_name: modelName,
      speaker_name: speakerName,
      sample_name: sampleName,
      sample_group: sampleGroup,
      sample_page_name: samplePageName,
      kind: kind,
      n_selected: 0,
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
