import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { Storage } from "@google-cloud/storage";

dotenv.config({ path: "../.env" });
const prisma = new PrismaClient();
const storage = new Storage();

function getWavFilesInDirectory(directoryPath: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(directoryPath);
  // eslint-disable-next-line no-restricted-syntax
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

async function listFiles(bucketName: string) {
  const [files] = await storage.bucket(bucketName).getFiles();
  return files;
}

async function uploadFile(
  bucketName: string,
  filePath: string,
  destFileName: string,
) {
  const options = {
    destination: destFileName,
  };
  await storage.bucket(bucketName).upload(filePath, options);
}

async function deleteFile(bucketName: string, fileName: string) {
  await storage.bucket(bucketName).file(fileName).delete();
}

async function main() {
  const localWavDir = process.env.LOCAL_WAV_DIR;
  if (localWavDir === undefined) {
    throw new Error("LOCAL_WAV_DIR was not specified.");
  }
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (bucketName === undefined) {
    throw new Error("GCS_BUCKET_NAME was not specified.");
  }

  const gcsFiles = await listFiles(bucketName);
  // eslint-disable-next-line no-restricted-syntax
  for (const file of gcsFiles) {
    deleteFile(bucketName, file.name);
  }

  const filePathList = getWavFilesInDirectory(localWavDir);

  const sampleMetaDataList = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const filePath of filePathList) {
    const filePathParts = filePath.split("/");
    const pageName = filePathParts[filePathParts.length - 7];
    const speakerName = filePathParts[filePathParts.length - 3];
    const modelName = filePathParts[filePathParts.length - 5];
    const sampleName = filePathParts[filePathParts.length - 2];
    const kind = filePathParts[filePathParts.length - 1].split(".")[0];
    const randomizedFilePath = `${uuidv4()}.wav`;
    uploadFile(bucketName, filePath, randomizedFilePath);
    sampleMetaDataList.push({
      page_name: pageName,
      file_path: randomizedFilePath,
      speaker_name: speakerName,
      model_name: modelName,
      sample_name: sampleName,
      // eslint-disable-next-line object-shorthand
      kind: kind,
    });
  }
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
