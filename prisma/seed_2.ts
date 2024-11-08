/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-restricted-syntax */
/* eslint-disable object-shorthand */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { diffieHellman } from "crypto";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dfd = require("danfojs-node");

const localWavDirTest = process.env.LOCAL_WAV_DIR_TEST;
const localWavDirVal = process.env.LOCAL_WAV_DIR_VAL;
const localWavDirDummy = process.env.LOCAL_WAV_DIR_DUMMY;
const localWavDirRandomized = process.env.LOCAL_WAV_DIR_RANDOMIZED;
const localUttPath = process.env.LOCAL_UTT_PATH;
const bucketName = process.env.GCS_BUCKET_NAME;
const supabaseUrl = process.env.SUPABASE_URL_DEV;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
const authLocalSavePath = process.env.LOCAL_AUTH_SAVE_PATH;
const modelNameGT = process.env.MODEL_NAME_GT;
const modelNameAbs = process.env.MODEL_NAME_ABS;

if (localWavDirTest === undefined) {
  throw new Error("LOCAL_WAV_DIR_TEST was not specified.");
}
if (localWavDirVal === undefined) {
  throw new Error("LOCAL_WAV_DIR_VAL was not specified.");
}
if (localWavDirDummy === undefined) {
  throw new Error("LOCAL_WAV_DIR_DUMMY was not specified.");
}
if (localWavDirRandomized === undefined) {
  throw new Error("LOCAL_WAV_DIR_RANDAMIZED was not specified.");
}
if (localUttPath === undefined) {
  throw new Error("LOCAL_UTT_PATH was not specified.");
}
if (bucketName === undefined) {
  throw new Error("GCS_BUCKET_NAME was not specified.");
}
if (supabaseUrl === undefined) {
  throw new Error("SUPABASE_URL_DEV was not specified.");
}
if (serviceRoleKey === undefined) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY_DEV was not specified.");
}
if (authLocalSavePath === undefined) {
  throw new Error("LOCAL_AUTH_SAVE_PATH was not specified.");
}
if (modelNameGT === undefined) {
  throw new Error("MODEL_NAME_GT was not specified.");
}
if (modelNameAbs === undefined) {
  throw new Error("MODEL_NAME_ABS_MEL was not specified.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
const prisma = new PrismaClient();

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

function getRandomElements<T>(array: T[], sampleSize: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, sampleSize);
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

function getModelNameAndSampleNameList(
  filePathList: string[],
): { modelNameList: string[]; sampleNameList: string[] } {
  const modelNameSet: Set<string> = new Set();
  const sampleNameSet: Set<string> = new Set();

  for (const filePath of filePathList) {
    const filePathParts = filePath.split("/");
    const modelName = filePathParts[filePathParts.length - 4];
    const sampleName = filePathParts[filePathParts.length - 2];
    modelNameSet.add(modelName);
    sampleNameSet.add(sampleName);
  }

  const modelNameList = Array.from(modelNameSet);
  const sampleNameList = Array.from(sampleNameSet);
  modelNameList.push("abs_mel_speech_ssl");
  modelNameList.push("gt");

  return {
    modelNameList,
    sampleNameList,
  };
}

function getSampleGroupSizeList(
  numModel: number,
  numSample: number,
): number[] {
  const baseSize = Math.floor(numSample / numModel);
  const remainder = numSample % numModel;
  const sampleGroupSizeList = Array(numModel).fill(baseSize);

  for (let i = 0; i < remainder; i += 1) {
    sampleGroupSizeList[i] += 1;
  }

  return sampleGroupSizeList;
}

function assignSampleGroups(
  sampleNameList: string[],
  sampleGroupSizeList: number[],
): Record<string, number> {
  const sampleNameListShuffled = shuffleArray(sampleNameList);
  const sampleGroupMap: Record<string, number> = {};
  let cumulativeSize = 0;

  for (
    let groupIndex = 0;
    groupIndex < sampleGroupSizeList.length;
    groupIndex += 1
  ) {
    const groupSize = sampleGroupSizeList[groupIndex];
    const groupSamples = sampleNameListShuffled.slice(
      cumulativeSize,
      cumulativeSize + groupSize,
    );

    groupSamples.forEach((sampleName) => {
      sampleGroupMap[sampleName] = groupIndex;
    });

    cumulativeSize += groupSize;
  }

  return sampleGroupMap;
}

function containsArray(arrays: string[][], array: string[]): boolean {
  return arrays.some(
    (a) =>
      a.length === array.length &&
      a.every((val, index) => val === array[index]),
  );
}

function getModelNameKindPairs(
  filePathList: string[],
): string[][] {
  const modelNameKindPairs: string[][] = [];

  filePathList.forEach((filePath) => {
    const filePathParts = filePath.split("/");
    const modelName = filePathParts[filePathParts.length - 4];
    const kind = filePathParts[filePathParts.length - 1].split(".")[0];

    if (
      kind === "pred_mel_speech_ssl" &&
      !containsArray(modelNameKindPairs, [modelName, kind])
    ) {
      modelNameKindPairs.push([modelName, kind]);
    }
  });

  modelNameKindPairs.push([modelNameAbs!, "abs_mel_speech_ssl"]);
  modelNameKindPairs.push([modelNameGT!, "gt"]);

  return modelNameKindPairs;
}

async function generateSampleMetaData(
  filePathList: string[],
  sampleGroupMapInt: Record<string, number>,
  sampleGroupMapSim: Record<string, number>,
  expType: string,
  modelNameKindPairlist: string[][],
): Promise<
  {
    sampleMetaDataList: {
      file_path: string;
      model_name: string;
      model_id: number;
      speaker_name: string;
      sample_name: string;
      sample_utt: string;
      sample_group_int_nat: number;
      sample_group_sim: number;
      exp_type: string;
      kind: string;
      is_dummy: boolean;
      intelligibility_dummy_correct_answer_id: number;
      similarity_dummy_correct_answer_id: number;
    }[];
    srcDestFilePathList: string[][];
  }
> {
  const sampleMetaDataList: {
    file_path: string;
    model_name: string;
    model_id: number;
    speaker_name: string;
    sample_name: string;
    sample_utt: string;
    sample_group_int_nat: number;
    sample_group_sim: number;
    exp_type: string;
    kind: string;
    is_dummy: boolean;
    intelligibility_dummy_correct_answer_id: number;
    similarity_dummy_correct_answer_id: number;
  }[] = [];

  const srcDestFilePathList: string[][] = [];
  const dfUtt = await dfd.readCSV(localUttPath);

  filePathList.forEach((filePath) => {
    const filePathParts = filePath.split("/");
    const modelName = filePathParts[filePathParts.length - 4];
    const speakerName = filePathParts[filePathParts.length - 3];
    const sampleName = filePathParts[filePathParts.length - 2];
    if (!(sampleName in sampleGroupMapInt)) {
      if (sampleName in sampleGroupMapSim) {
        throw new Error("Unexpected Error");
      }
      return;
    }
    const sampleUttNum = sampleName.split("_")[1];
    const dfUttRow = dfUtt.loc({ rows: dfUtt["utt_num"].eq(sampleUttNum) });
    if (dfUttRow.shape[0] !== 1) {
      throw new Error(`The shape of dfUttRow: ${dfUttRow.shape}`);
    }
    const sampleUtt = dfUttRow["text"].values[0];
    const sampleGroupInt = sampleGroupMapInt[sampleName];
    const sampleGroupSim = sampleGroupMapSim[sampleName];
    const kind = filePathParts[filePathParts.length - 1].split(".")[0];
    const randomizedFilePath = `${uuidv4()}.wav`;

    const modelId = modelNameKindPairlist.findIndex(
      (pair) => pair[0] === modelName && pair[1] === kind,
    );
    if (modelId === -1) {
      return;
    }

    srcDestFilePathList.push([filePath, randomizedFilePath]);
    sampleMetaDataList.push({
      file_path: randomizedFilePath,
      model_name: modelName,
      model_id: modelId,
      speaker_name: speakerName,
      sample_name: sampleName,
      sample_utt: sampleUtt,
      sample_group_int_nat: sampleGroupInt,
      sample_group_sim: sampleGroupSim,
      exp_type: expType,
      kind: kind,
      is_dummy: false,
      intelligibility_dummy_correct_answer_id: 1,
      similarity_dummy_correct_answer_id: 1,
    });
  });

  return { sampleMetaDataList, srcDestFilePathList };
}

async function makeDataFrameInt(
  sampleMetaDataList: {
    file_path: string;
    model_name: string;
    model_id: number;
    speaker_name: string;
    sample_name: string;
    sample_utt: string;
    sample_group_int_nat: number;
    sample_group_sim: number;
    exp_type: string;
    kind: string;
    is_dummy: boolean;
    intelligibility_dummy_correct_answer_id: number;
    similarity_dummy_correct_answer_id: number;
  }[],
  expType: string,
  numTrial: number,
  numDummyUsers: number,
): Promise<
  {
    respondentFilePathListInt: { id: number; file_path_list: string[] }[];
    authList: { respondent_id: number; email: string; password: string }[];
  }
> {
  const df = new dfd.DataFrame(sampleMetaDataList);

  const sampleNameList = df["sample_name"].unique().values;
  const modelIdList = df["model_id"].unique().values;
  const numTrialWithDummyUsers = numTrial + numDummyUsers;
  const passwordLength = 6;
  const respondentFilePathListInt: {
    id: number;
    file_path_list: string[];
  }[] = [];
  const authList: { respondent_id: number; email: string; password: string }[] =
    [];

  for (let trial = 0; trial < numTrialWithDummyUsers; trial += 1) {
    const selectedData: {
      file_path: string[];
    } = {
      file_path: [],
    };
    const sampleNameListShuffled = shuffleArray(
      sampleNameList,
    );
    const modelIdListShuffled = shuffleArray(
      modelIdList,
    );
    for (let i = 0; i < sampleNameListShuffled.length; i += 1) {
      let dfCandSampled = df
        .loc({
          rows: df["sample_name"]
            .eq(sampleNameListShuffled[i])
            .and(
              df["model_id"].eq(
                modelIdListShuffled[i % modelIdListShuffled.length],
              ),
            ),
        })
        .copy()
        .resetIndex();
      if (dfCandSampled.shape[0] !== dfCandSampled["speaker_name"].nUnique()) {
        throw new Error(
          `The number of rows in the dataframe does not match the number of speakers. ${
            dfCandSampled.shape[0]
          } != ${dfCandSampled["speaker_name"].nUnique()}`,
        );
      }
      dfCandSampled = dfCandSampled.iloc({
        rows: [Math.floor(Math.random() * dfCandSampled.shape[0])],
      });

      selectedData.file_path.push(dfCandSampled["file_path"].values[0]);
    }

    const respondentId = trial + 1;

    if (expType === "main") {
      if (trial < numTrial) {
        const email = `user${respondentId}@test.com`;
        const password = generateRandomString(passwordLength);
        const { error: createUserError } = await supabase
          .auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
          });
        if (createUserError) {
          console.error(`createUserError: ${createUserError}`);
        }
        authList.push({
          respondent_id: respondentId,
          email: email,
          password: password,
        });
        console.log(respondentId, email, password);
      } else {
        const email = `dummy${respondentId}@test.com`;
        const password = generateRandomString(passwordLength);
        const { error: createUserError } = await supabase
          .auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
          });
        if (createUserError) {
          console.error(`createUserError: ${createUserError}`);
        }
        authList.push({
          respondent_id: respondentId,
          email: email,
          password: password,
        });
        console.log(respondentId, email, password);
      }
    }

    respondentFilePathListInt.push({
      id: respondentId,
      file_path_list: selectedData.file_path,
    });
  }

  return { respondentFilePathListInt, authList };
}

function makeDataFrameSim(
  sampleMetaDataList: {
    file_path: string;
    model_name: string;
    model_id: number;
    speaker_name: string;
    sample_name: string;
    sample_utt: string;
    sample_group_int_nat: number;
    sample_group_sim: number;
    exp_type: string;
    kind: string;
    is_dummy: boolean;
    intelligibility_dummy_correct_answer_id: number;
    similarity_dummy_correct_answer_id: number;
  }[],
  numTrial: number,
  numDummyUsers: number,
  isGTIncluded: boolean,
): {
  id: number;
  file_path_eval_list: string[];
  file_path_gt_list: string[];
}[] {
  const df = new dfd.DataFrame(sampleMetaDataList);
  const dfGT = df.loc({ rows: df["kind"].eq("gt") }).copy();
  let dfEval = df.copy();
  if (!isGTIncluded) {
    dfEval = dfEval.loc({ rows: dfEval["kind"].ne("gt") });
  }

  const sampleNameList = dfEval["sample_name"].unique().values;
  const modelIdList = dfEval["model_id"].unique().values;
  const numSample = dfEval["sample_name"].nUnique();
  const numTrialWithDummyUsers = numTrial + numDummyUsers;
  const respondentFilePathList: {
    id: number;
    file_path_eval_list: string[];
    file_path_gt_list: string[];
  }[] = [];

  for (let trial = 0; trial < numTrialWithDummyUsers; trial += 1) {
    const selectedData: {
      file_path: string[];
      file_path_gt: string[];
    } = {
      file_path: [],
      file_path_gt: [],
    };
    const sampleNameListShuffled = shuffleArray(
      sampleNameList,
    );
    const modelIdListShuffled = shuffleArray(
      modelIdList,
    );
    for (let i = 0; i < sampleNameListShuffled.length; i += 1) {
      let dfCandSampled = dfEval
        .loc({
          rows: dfEval["sample_name"]
            .eq(sampleNameListShuffled[i])
            .and(
              dfEval["model_id"].eq(
                modelIdListShuffled[i % modelIdListShuffled.length],
              ),
            ),
        })
        .copy()
        .resetIndex();
      if (dfCandSampled.shape[0] !== dfCandSampled["speaker_name"].nUnique()) {
        throw new Error(
          `The number of rows in the dataframe does not match the number of speakers. ${
            dfCandSampled.shape[0]
          } != ${dfCandSampled["speaker_name"].nUnique()}`,
        );
      }
      dfCandSampled = dfCandSampled.iloc({
        rows: [Math.floor(Math.random() * dfCandSampled.shape[0])],
      });

      let dfGTSampled = dfGT.loc({
        rows: dfGT["speaker_name"].eq(dfCandSampled["speaker_name"].values[0]),
      });
      if (dfGTSampled.shape[0] !== numSample) {
        throw new Error(
          `The number of rows in the dataframe does not match the number of samples. ${
            dfGTSampled.shape[0]
          } != ${numSample}.`,
        );
      }
      dfGTSampled = dfGTSampled.iloc({
        rows: [Math.floor(Math.random() * dfGTSampled.shape[0])],
      });

      selectedData.file_path.push(dfCandSampled["file_path"].values[0]);
      selectedData.file_path_gt.push(dfGTSampled["file_path"].values[0]);
    }

    const respondentId = trial + 1;

    respondentFilePathList.push({
      id: respondentId,
      file_path_eval_list: selectedData.file_path,
      file_path_gt_list: selectedData.file_path_gt,
    });
  }

  return respondentFilePathList;
}

async function makeDataFrames(
  filePathList: string[],
  expType: string,
  numTrial: number,
  numDummyUsers: number,
  isGTIncludedSim: boolean,
): Promise<
  {
    sampleMetaDataList: {
      file_path: string;
      model_name: string;
      model_id: number;
      speaker_name: string;
      sample_name: string;
      sample_utt: string;
      sample_group_int_nat: number;
      sample_group_sim: number;
      exp_type: string;
      kind: string;
      is_dummy: boolean;
      intelligibility_dummy_correct_answer_id: number;
      similarity_dummy_correct_answer_id: number;
    }[];
    srcDestFilePathList: string[][];
    respondentFilePathListInt: { id: number; file_path_list: string[] }[];
    respondentFilePathListSim: {
      id: number;
      file_path_eval_list: string[];
      file_path_gt_list: string[];
    }[];
    authList: { respondent_id: number; email: string; password: string }[];
  }
> {
  const modelNameAndSampleNameList = getModelNameAndSampleNameList(
    filePathList,
  );
  const { modelNameList } = modelNameAndSampleNameList;
  let { sampleNameList } = modelNameAndSampleNameList;
  if (expType === "practice") {
    sampleNameList = getRandomElements(sampleNameList, modelNameList.length);
  }
  const modelNameKindPairList = getModelNameKindPairs(
    filePathList,
  );
  const sampleGroupSizeListInt = getSampleGroupSizeList(
    modelNameList.length,
    sampleNameList.length,
  );
  const sampleGroupMapInt = assignSampleGroups(
    sampleNameList,
    sampleGroupSizeListInt,
  );
  const sampleGroupSizeListSim = getSampleGroupSizeList(
    isGTIncludedSim ? modelNameList.length : modelNameList.length - 1,
    sampleNameList.length,
  );
  const sampleGroupMapSim = assignSampleGroups(
    sampleNameList,
    sampleGroupSizeListSim,
  );
  const { sampleMetaDataList, srcDestFilePathList } =
    await generateSampleMetaData(
      filePathList,
      sampleGroupMapInt,
      sampleGroupMapSim,
      expType,
      modelNameKindPairList,
    );
  const {
    respondentFilePathListInt,
    authList,
  } = await makeDataFrameInt(
    sampleMetaDataList,
    expType,
    numTrial,
    numDummyUsers,
  );
  const respondentFilePathListSim = makeDataFrameSim(
    sampleMetaDataList,
    numTrial,
    numDummyUsers,
    isGTIncludedSim,
  );
  return {
    sampleMetaDataList,
    srcDestFilePathList,
    respondentFilePathListInt,
    respondentFilePathListSim,
    authList,
  };
}

async function main() {
  // eslint-disable-next-line no-constant-condition
  console.log("Delete Previous Users");
  while (true) {
    const {
      data: { users },
      error: listUserError,
    } = await supabase.auth.admin.listUsers();

    if (listUserError) {
      console.error(`listUserError: ${listUserError}`);
      process.exit(1);
    }

    if (users.length === 0) {
      break;
    }

    for (const user of users) {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
        user.id,
      );

      if (deleteUserError) {
        console.error(`deleteUserError: ${deleteUserError}`);
        process.exit(1);
      }
    }
  }

  const filePathListTest = getWavFilesInDirectory(localWavDirTest!);
  const filePathListVal = getWavFilesInDirectory(localWavDirVal!);
  const numTrial = 110;
  const numDummyUsers = 50;
  const isGTIncludedSim = true;

  console.log("makeDataFrames: main");
  const {
    sampleMetaDataList: sampleMetaDataListMain,
    srcDestFilePathList: srcDestFilePathListMain,
    respondentFilePathListInt: respondentFilePathListIntMain,
    respondentFilePathListSim: respondentFilePathListSimMain,
    authList,
  } = await makeDataFrames(
    filePathListTest,
    "main",
    numTrial,
    numDummyUsers,
    isGTIncludedSim,
  );

  console.log("makeDataFrames: practice");
  const {
    sampleMetaDataList: sampleMetaDataListPractice,
    srcDestFilePathList: srcDestFilePathListPractice,
    respondentFilePathListInt: respondentFilePathListIntPractice,
    respondentFilePathListSim: respondentFilePathListSimPractice,
  } = await makeDataFrames(
    filePathListVal,
    "practice",
    numTrial,
    numDummyUsers,
    isGTIncludedSim,
  );

  const sampleMetaDataList = sampleMetaDataListMain.concat(
    sampleMetaDataListPractice,
  );
  const srcDestFilePathList = srcDestFilePathListMain.concat(
    srcDestFilePathListPractice,
  );

  console.log("update respondents");
  for (
    let respondentId = 1;
    respondentId <= respondentFilePathListIntMain.length;
    respondentId += 1
  ) {
    const respondentFilePathIntMain = respondentFilePathListIntMain
      .filter((
        value,
      ) => value.id === respondentId);
    const respondentFilePathIntPractice = respondentFilePathListIntPractice
      .filter((
        value,
      ) => value.id === respondentId);
    const respondentFilePathSimMain = respondentFilePathListSimMain.filter((
      value,
    ) => value.id === respondentId);
    const respondentFilePathSimPractice = respondentFilePathListSimPractice
      .filter((
        value,
      ) => value.id === respondentId);

    if (respondentFilePathIntMain.length !== 1) {
      throw new Error(
        `respondentFilePathIntMain.length = ${respondentFilePathIntMain.length}`,
      );
    }
    if (respondentFilePathIntPractice.length !== 1) {
      throw new Error(
        `respondentFilePathIntPractice.length = ${respondentFilePathIntPractice.length}`,
      );
    }
    if (respondentFilePathSimMain.length !== 1) {
      throw new Error(
        `respondentFilePathSimMain.length = ${respondentFilePathSimMain.length}`,
      );
    }
    if (respondentFilePathSimPractice.length !== 1) {
      throw new Error(
        `respondentFilePathSimPractice.length = ${respondentFilePathSimPractice.length}`,
      );
    }

    const respondentFilePathInt = respondentFilePathIntMain[0]
      .file_path_list.concat(
        respondentFilePathIntPractice[0].file_path_list,
      );
    const respondentFilePathSimEval = respondentFilePathSimMain[0]
      .file_path_eval_list.concat(
        respondentFilePathSimPractice[0].file_path_eval_list,
      );
    const respondentFilePathSimGT = respondentFilePathSimMain[0]
      .file_path_gt_list.concat(
        respondentFilePathSimPractice[0].file_path_gt_list,
      );
    if (
      respondentId <= respondentFilePathListIntMain.length - numDummyUsers
    ) {
      console.log(`respondentId: ${respondentId} is not dummy.`);
      await prisma.respondents.update({
        where: {
          id: respondentId,
        },
        data: {
          file_path_list_int: respondentFilePathInt,
          file_path_list_sim_eval: respondentFilePathSimEval,
          file_path_list_sim_gt: respondentFilePathSimGT,
        },
      });
    } else {
      console.log(`respondentId: ${respondentId} is dummy.`);
      await prisma.respondents.update({
        where: {
          id: respondentId,
        },
        data: {
          is_dummy: true,
          file_path_list_int: respondentFilePathInt,
          file_path_list_sim_eval: respondentFilePathSimEval,
          file_path_list_sim_gt: respondentFilePathSimGT,
        },
      });
    }
  }

  const dfAuth = new dfd.DataFrame(authList);
  dfd.toCSV(dfAuth, {
    filePath: authLocalSavePath,
  });

  const intelligibilityItemList = [
    { item: "全く聞き取れなかった" },
    { item: "ほとんど聞き取れなかった" },
    { item: "ある程度聞き取れた" },
    { item: "ほとんど聞き取れた" },
    { item: "完全に聞き取れた" },
  ];
  const similarityItemList = [
    { item: "全く似ていなかった" },
    { item: "あまり似ていなかった" },
    { item: "やや似ていた" },
    { item: "かなり似ていた" },
    { item: "同じ話者に聞こえた" },
  ];

  const filePathDummyList = getWavFilesInDirectory(localWavDirDummy!);
  for (const filePath of filePathDummyList) {
    const filePathParts = filePath.split("/");
    const expType = filePathParts[filePathParts.length - 2];
    const expName =
      filePathParts[filePathParts.length - 1].split(".")[0].split("_")[0];
    const randomizedFilePath = `${uuidv4()}.wav`;

    if (expName === "int") {
      const intId = Number(
        filePathParts[filePathParts.length - 1].split(".")[0].split("_")[1],
      );
      sampleMetaDataList.push({
        file_path: randomizedFilePath,
        model_name: "dummy",
        model_id: -1,
        speaker_name: "dummy",
        sample_name: expName,
        sample_utt: `これはダミー音声です。明瞭性は「${intId}: ${
          intelligibilityItemList[intId - 1].item
        }」を選択してください。`,
        sample_group_int_nat: -1,
        sample_group_sim: -1,
        exp_type: expType,
        kind: "dummy",
        is_dummy: true,
        intelligibility_dummy_correct_answer_id: intId,
        similarity_dummy_correct_answer_id: 1,
      });
    } else if (expName === "sim") {
      const simId = Number(
        filePathParts[filePathParts.length - 1].split(".")[0].split("_")[1],
      );
      sampleMetaDataList.push({
        file_path: randomizedFilePath,
        model_name: "dummy",
        model_id: -1,
        speaker_name: "dummy",
        sample_name: expName,
        sample_utt: `これはダミー音声です。類似性は「${simId}: ${
          similarityItemList[simId - 1].item
        }」を選択してください。`,
        sample_group_int_nat: -1,
        sample_group_sim: -1,
        exp_type: expType,
        kind: "dummy",
        is_dummy: true,
        intelligibility_dummy_correct_answer_id: 1,
        similarity_dummy_correct_answer_id: simId,
      });
    }

    srcDestFilePathList.push([filePath, randomizedFilePath]);
  }

  console.log("copyFiles");
  copyFiles(localWavDirRandomized!, srcDestFilePathList);
  console.log("Upload files to GCS");
  execSync(`gsutil -m cp ${localWavDirRandomized}/*.wav gs://${bucketName}`);

  console.log("create Data");
  const sexItemList = [{ item: "男性" }, { item: "女性" }, { item: "無回答" }];
  await prisma.sexItem.createMany({
    data: sexItemList,
    skipDuplicates: true,
  });

  const audioDeviceList = [{ item: "ヘッドホン" }, { item: "イヤホン" }];
  await prisma.audioDeviceItem.createMany({
    data: audioDeviceList,
    skipDuplicates: true,
  });

  await prisma.intelligibilityItem.createMany({
    data: intelligibilityItemList,
    skipDuplicates: true,
  });

  await prisma.similarityItem.createMany({
    data: similarityItemList,
    skipDuplicates: true,
  });

  await prisma.sampleMetaData.createMany({
    data: sampleMetaDataList,
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
