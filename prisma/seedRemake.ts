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
import { Storage } from "@google-cloud/storage";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dfd = require("danfojs-node");

const localWavDirTest = process.env.LOCAL_WAV_DIR_TEST;
const localWavDirVal = process.env.LOCAL_WAV_DIR_VAL;
const localWavDirDummy = process.env.LOCAL_WAV_DIR_DUMMY;
const localWavDirRandomized = process.env.LOCAL_WAV_DIR_RANDOMIZED;
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

  if (
    containsArray(modelNameKindPairs, [modelNameAbs!, "abs_mel_speech_ssl"])
  ) {
    throw new Error(`modelNameAbs(${modelNameAbs}) has already included.`);
  }
  if (
    containsArray(modelNameKindPairs, [modelNameGT!, "gt"])
  ) {
    throw new Error(`modelNameGT(${modelNameGT}) has already included.`);
  }

  modelNameKindPairs.push([modelNameAbs!, "abs_mel_speech_ssl"]);
  modelNameKindPairs.push([modelNameGT!, "gt"]);

  return modelNameKindPairs;
}

function generateSampleMetaData(
  filePathList: string[],
  sampleGroupMapIntNat: Record<string, number>,
  sampleGroupMapSim: Record<string, number>,
  expType: string,
  modelNameKindPairlist: string[][],
): {
  sampleMetaDataList: {
    file_path: string;
    model_name: string;
    model_id: number;
    speaker_name: string;
    sample_name: string;
    sample_group_int_nat: number;
    sample_group_sim: number;
    exp_type: string;
    kind: string;
    is_dummy: boolean;
    naturalness_dummy_correct_answer_id: number;
    intelligibility_dummy_correct_answer_id: number;
    similarity_dummy_correct_answer_id: number;
  }[];
  srcDestFilePathList: string[][];
} {
  const sampleMetaDataList: {
    file_path: string;
    model_name: string;
    model_id: number;
    speaker_name: string;
    sample_name: string;
    sample_group_int_nat: number;
    sample_group_sim: number;
    exp_type: string;
    kind: string;
    is_dummy: boolean;
    naturalness_dummy_correct_answer_id: number;
    intelligibility_dummy_correct_answer_id: number;
    similarity_dummy_correct_answer_id: number;
  }[] = [];

  const srcDestFilePathList: string[][] = [];

  filePathList.forEach((filePath) => {
    const filePathParts = filePath.split("/");
    const modelName = filePathParts[filePathParts.length - 4];
    const speakerName = filePathParts[filePathParts.length - 3];
    const sampleName = filePathParts[filePathParts.length - 2];
    if (!(sampleName in sampleGroupMapIntNat)) {
      if (sampleName in sampleGroupMapSim) {
        throw new Error("Unexpected Error");
      }
      return;
    }
    const sampleGroupIntNat = sampleGroupMapIntNat[sampleName];
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
      sample_group_int_nat: sampleGroupIntNat,
      sample_group_sim: sampleGroupSim,
      exp_type: expType,
      kind: kind,
      is_dummy: false,
      naturalness_dummy_correct_answer_id: 1,
      intelligibility_dummy_correct_answer_id: 1,
      similarity_dummy_correct_answer_id: 1,
    });
  });

  return { sampleMetaDataList, srcDestFilePathList };
}

async function makeDataFrameIntNat(
  sampleMetaDataList: {
    file_path: string;
    model_name: string;
    model_id: number;
    speaker_name: string;
    sample_name: string;
    sample_group_int_nat: number;
    sample_group_sim: number;
    exp_type: string;
    kind: string;
    is_dummy: boolean;
    naturalness_dummy_correct_answer_id: number;
    intelligibility_dummy_correct_answer_id: number;
    similarity_dummy_correct_answer_id: number;
  }[],
  expType: string,
  numAnsPerSample: number,
  numDummyUsers: number,
): Promise<
  {
    respondentFilePathListIntNat: { id: number; file_path_list: string[] }[];
    authList: { respondent_id: number; email: string; password: string }[];
  }
> {
  let df = new dfd.DataFrame(sampleMetaDataList);
  df.addColumn("n_selected", Array(sampleMetaDataList.length).fill(0), {
    inplace: true,
  });

  // dfd.toCSV(df, {
  //   filePath:
  //     "/Users/minami/dev/nextjs/subjective-evaluation-test-2/check/int_nat/full.csv",
  // });

  const numSpeaker = df["speaker_name"].nUnique();
  const numModel = df["model_id"].nUnique();
  const numTrial = numSpeaker * numModel * numAnsPerSample;
  const numTrialWithDummyUsers = numTrial + numDummyUsers;
  const passwordLength = 6;
  const respondentFilePathListIntNat: {
    id: number;
    file_path_list: string[];
  }[] = [];
  const authList: { respondent_id: number; email: string; password: string }[] =
    [];

  for (let trial = 0; trial < numTrialWithDummyUsers; trial += 1) {
    const dfCand = df["n_selected"].nUnique() === 1
      ? df.copy()
      : df.loc({ rows: df["n_selected"].lt(df["n_selected"].max()) }).copy();

    dfCand.addColumn(
      "model_assign_id",
      dfCand["sample_group_int_nat"].add(trial).mod(numModel),
      { inplace: true },
    );

    const selectedData: {
      file_path: string[];
      is_selected: number[];
    } = {
      file_path: [],
      is_selected: [],
    };

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
          `The number of rows in the dataframe does not match the number of speakers. ${
            dfCandSampled.shape[0]
          } != ${dfCandSampled["speaker_name"].nUnique()}`,
        );
      }
      dfCandSampled = dfCandSampled.iloc({
        rows: [Math.floor(Math.random() * dfCandSampled.shape[0])],
      });

      selectedData.file_path.push(dfCandSampled["file_path"].values[0]);
      selectedData.is_selected.push(1);
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

    if (expType === "main") {
      if (trial < numTrial) {
        const email = `user${trial}@test.com`;
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
          respondent_id: trial + 1,
          email: email,
          password: password,
        });
        console.log(trial, email, password);
      } else {
        const email = `dummy${trial}@test.com`;
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
          respondent_id: trial + 1,
          email: email,
          password: password,
        });
        console.log(trial, email, password);
      }
    }

    respondentFilePathListIntNat.push({
      id: trial + 1,
      file_path_list: selectedData.file_path,
    });
  }

  return { respondentFilePathListIntNat, authList };
}

function makeDataFrameSim(
  sampleMetaDataList: {
    file_path: string;
    model_name: string;
    model_id: number;
    speaker_name: string;
    sample_name: string;
    sample_group_int_nat: number;
    sample_group_sim: number;
    exp_type: string;
    kind: string;
    is_dummy: boolean;
    naturalness_dummy_correct_answer_id: number;
    intelligibility_dummy_correct_answer_id: number;
    similarity_dummy_correct_answer_id: number;
  }[],
  numAnsPerSample: number,
  numDummyUsers: number,
): {
  id: number;
  file_path_synth_list: string[];
  file_path_gt_list: string[];
}[] {
  const df = new dfd.DataFrame(sampleMetaDataList);
  const dfGT = df.loc({ rows: df["kind"].eq("gt") }).copy();
  let dfSynth = df.loc({ rows: df["kind"].ne("gt") }).copy();
  dfSynth.addColumn("n_selected", Array(dfSynth.shape[0]).fill(0), {
    inplace: true,
  });

  // dfd.toCSV(df, {
  //   filePath:
  //     "/Users/minami/dev/nextjs/subjective-evaluation-test-2/check/sim/full.csv",
  // });
  // dfd.toCSV(dfGT, {
  //   filePath:
  //     "/Users/minami/dev/nextjs/subjective-evaluation-test-2/check/sim/gt.csv",
  // });
  // dfd.toCSV(dfSynth, {
  //   filePath:
  //     "/Users/minami/dev/nextjs/subjective-evaluation-test-2/check/sim/synth.csv",
  // });

  const numSpeaker = dfSynth["speaker_name"].nUnique();
  const numModel = dfSynth["model_id"].nUnique();
  const numSample = dfSynth["sample_name"].nUnique();
  // Simは原音声を含まない分numTrialが減るので、増やして揃えることで対応
  const numTrial = numSpeaker * numModel * numAnsPerSample +
    numSpeaker * numAnsPerSample;
  const numTrialWithDummyUsers = numTrial + numDummyUsers;
  const respondentFilePathList: {
    id: number;
    file_path_synth_list: string[];
    file_path_gt_list: string[];
  }[] = [];

  for (let trial = 0; trial < numTrialWithDummyUsers; trial += 1) {
    const dfCand = dfSynth["n_selected"].nUnique() === 1
      ? dfSynth.copy()
      : dfSynth.loc({
        rows: dfSynth["n_selected"].lt(dfSynth["n_selected"].max()),
      }).copy();

    dfCand.addColumn(
      "model_assign_id",
      dfCand["sample_group_sim"].add(trial).mod(numModel),
      { inplace: true },
    );

    const selectedData: {
      file_path: string[];
      file_path_gt_pair: string[];
      is_selected: number[];
    } = {
      file_path: [],
      file_path_gt_pair: [],
      is_selected: [],
    };

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
      selectedData.file_path_gt_pair.push(dfGTSampled["file_path"].values[0]);
      selectedData.is_selected.push(1);
    }

    const dfSelectedData = new dfd.DataFrame(selectedData);
    for (const col of dfSelectedData.columns) {
      if (
        dfSynth.columns.includes(col) &&
        dfSelectedData[col].dtype !== dfSynth[col].dtype
      ) {
        dfSelectedData.asType(col, dfSynth[col].dtype, { inplace: true });
      }
    }

    dfSynth = dfd
      .merge({
        left: dfSynth,
        right: dfSelectedData,
        on: ["file_path"],
        how: "left",
      })
      .fillNa([0], { columns: ["is_selected"] });

    dfSynth["n_selected"] = dfSynth["n_selected"].add(dfSynth["is_selected"]);
    dfSynth.drop({
      columns: ["is_selected", "file_path_gt_pair"],
      inplace: true,
    });

    respondentFilePathList.push({
      id: trial + 1,
      file_path_synth_list: selectedData.file_path,
      file_path_gt_list: selectedData.file_path_gt_pair,
    });
  }

  return respondentFilePathList;
}

async function makeDataFrames(
  filePathList: string[],
  expType: string,
  numAnsPerSample: number,
  numDummyUsers: number,
): Promise<
  {
    sampleMetaDataList: {
      file_path: string;
      model_name: string;
      model_id: number;
      speaker_name: string;
      sample_name: string;
      sample_group_int_nat: number;
      sample_group_sim: number;
      exp_type: string;
      kind: string;
      is_dummy: boolean;
      naturalness_dummy_correct_answer_id: number;
      intelligibility_dummy_correct_answer_id: number;
      similarity_dummy_correct_answer_id: number;
    }[];
    srcDestFilePathList: string[][];
    respondentFilePathListIntNat: { id: number; file_path_list: string[] }[];
    respondentFilePathListSim: {
      id: number;
      file_path_synth_list: string[];
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
  const sampleGroupSizeListIntNat = getSampleGroupSizeList(
    modelNameList.length,
    sampleNameList.length,
  );
  const sampleGroupMapIntNat = assignSampleGroups(
    sampleNameList,
    sampleGroupSizeListIntNat,
  );
  const sampleGroupSizeListSim = getSampleGroupSizeList(
    modelNameList.length - 1,
    sampleNameList.length,
  );
  const sampleGroupMapSim = assignSampleGroups(
    sampleNameList,
    sampleGroupSizeListSim,
  );
  const { sampleMetaDataList, srcDestFilePathList } = generateSampleMetaData(
    filePathList,
    sampleGroupMapIntNat,
    sampleGroupMapSim,
    expType,
    modelNameKindPairList,
  );
  const {
    respondentFilePathListIntNat,
    authList,
  } = await makeDataFrameIntNat(
    sampleMetaDataList,
    expType,
    numAnsPerSample,
    numDummyUsers,
  );
  const respondentFilePathListSim = makeDataFrameSim(
    sampleMetaDataList,
    numAnsPerSample,
    numDummyUsers,
  );
  return {
    sampleMetaDataList,
    srcDestFilePathList,
    respondentFilePathListIntNat,
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
  const numAnsPerSample = 4;
  const numDummyUsers = 10;

  console.log("makeDataFrames: main");
  const {
    sampleMetaDataList: sampleMetaDataListTest,
    srcDestFilePathList: srcDestFilePathListTest,
    respondentFilePathListIntNat: respondentFilePathListIntNatTest,
    respondentFilePathListSim: respondentFilePathListSimTest,
    authList,
  } = await makeDataFrames(
    filePathListTest,
    "main",
    numAnsPerSample,
    numDummyUsers,
  );

  console.log("makeDataFrames: practice");
  const {
    sampleMetaDataList: sampleMetaDataListVal,
    srcDestFilePathList: srcDestFilePathListVal,
    respondentFilePathListIntNat: respondentFilePathListIntNatVal,
    respondentFilePathListSim: respondentFilePathListSimVal,
  } = await makeDataFrames(
    filePathListVal,
    "practice",
    numAnsPerSample,
    numDummyUsers,
  );

  const sampleMetaDataList = sampleMetaDataListTest.concat(
    sampleMetaDataListVal,
  );
  const srcDestFilePathList = srcDestFilePathListTest.concat(
    srcDestFilePathListVal,
  );

  const respondentFilePathListIntNat: {
    id: number;
    file_path_list: string[];
  }[] = [];
  const respondentFilePathListSim: {
    id: number;
    file_path_synth_list: string[];
    file_path_gt_list: string[];
  }[] = [];
  for (
    let respondentId = 1;
    respondentId <= respondentFilePathListIntNatTest.length;
    respondentId += 1
  ) {
    const respondentFilePathIntNatTest = respondentFilePathListIntNatTest
      .filter((
        value,
      ) => value.id === respondentId);
    const respondentFilePathIntNatVal = respondentFilePathListIntNatVal.filter((
      value,
    ) => value.id === respondentId);
    const respondentFilePathSimTest = respondentFilePathListSimTest.filter((
      value,
    ) => value.id === respondentId);
    const respondentFilePathSimVal = respondentFilePathListSimVal.filter((
      value,
    ) => value.id === respondentId);

    if (respondentFilePathIntNatTest.length !== 1) {
      throw new Error(
        `respondentFilePathIntNatTest.length = ${respondentFilePathIntNatTest.length}`,
      );
    }
    if (respondentFilePathIntNatVal.length !== 1) {
      throw new Error(
        `respondentFilePathIntNatVal.length = ${respondentFilePathIntNatVal.length}`,
      );
    }
    if (respondentFilePathSimTest.length !== 1) {
      throw new Error(
        `respondentFilePathSimTest.length = ${respondentFilePathSimTest.length}`,
      );
    }
    if (respondentFilePathSimVal.length !== 1) {
      throw new Error(
        `respondentFilePathSimVal.length = ${respondentFilePathSimVal.length}`,
      );
    }

    respondentFilePathListIntNat.push({
      id: respondentId,
      file_path_list: respondentFilePathIntNatTest[0]?.file_path_list.concat(
        respondentFilePathIntNatVal[0]?.file_path_list,
      ),
    });
    respondentFilePathListSim.push({
      id: respondentId,
      file_path_synth_list: respondentFilePathSimTest[0]?.file_path_synth_list
        .concat(
          respondentFilePathSimVal[0]?.file_path_synth_list,
        ),
      file_path_gt_list: respondentFilePathSimTest[0]?.file_path_gt_list
        .concat(
          respondentFilePathSimVal[0]?.file_path_gt_list,
        ),
    });
  }

  const dfAuth = new dfd.DataFrame(authList);
  dfd.toCSV(dfAuth, {
    filePath: authLocalSavePath,
  });

  const filePathDummyList = getWavFilesInDirectory(localWavDirDummy!);
  for (const filePath of filePathDummyList) {
    const filePathParts = filePath.split("/");
    const expType = filePathParts[filePathParts.length - 2];
    const expName =
      filePathParts[filePathParts.length - 1].split(".")[0].split("_")[0];
    const randomizedFilePath = `${uuidv4()}.wav`;

    if (expName === "intnat") {
      const intId = Number(
        filePathParts[filePathParts.length - 1].split(".")[0].split("_")[1],
      );
      const natId = Number(
        filePathParts[filePathParts.length - 1].split(".")[0].split("_")[2],
      );
      sampleMetaDataList.push({
        file_path: randomizedFilePath,
        model_name: "dummy",
        model_id: -1,
        speaker_name: "dummy",
        sample_name: expName,
        sample_group_int_nat: -1,
        sample_group_sim: -1,
        exp_type: expType,
        kind: "dummy",
        is_dummy: true,
        naturalness_dummy_correct_answer_id: natId,
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
        sample_group_int_nat: -1,
        sample_group_sim: -1,
        exp_type: expType,
        kind: "dummy",
        is_dummy: true,
        naturalness_dummy_correct_answer_id: 1,
        intelligibility_dummy_correct_answer_id: 1,
        similarity_dummy_correct_answer_id: simId,
      });
    }

    srcDestFilePathList.push([filePath, randomizedFilePath]);
  }

  console.log("Update respondentFilePathList");
  for (const respondentFilePathIntNat of respondentFilePathListIntNat) {
    await prisma.respondents.update({
      where: {
        id: respondentFilePathIntNat.id,
      },
      data: {
        file_path_list_eval_int_nat: respondentFilePathIntNat.file_path_list,
      },
    });
  }
  for (const respondentFilePathSim of respondentFilePathListSim) {
    await prisma.respondents.update({
      where: {
        id: respondentFilePathSim.id,
      },
      data: {
        file_path_list_eval_sim_synth:
          respondentFilePathSim.file_path_synth_list,
        file_path_list_eval_sim_gt: respondentFilePathSim.file_path_gt_list,
      },
    });
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

  const similarityItemList = [
    { item: "非常に悪い" },
    { item: "悪い" },
    { item: "普通" },
    { item: "良い" },
    { item: "非常に良い" },
  ];
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
