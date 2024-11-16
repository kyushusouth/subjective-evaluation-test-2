/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/dot-notation */
import { unstable_noStore as noStore } from "next/cache";
import prisma from "@/app/lib/prisma";
import { SampleMetaData } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export async function fetchRespondent() {
  noStore();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated.");

    const respondent = await prisma.respondents.findUnique({
      where: {
        auth_id: user.id,
      },
    });

    if (!respondent) throw new Error("Respondent not found.");

    return respondent;
  } catch (error) {
    console.error("Error in fetchRespondent:", error);
    throw new Error("Failed to fetch respondent.");
  }
}

export async function fetchSexItemList() {
  noStore();
  try {
    const sexItemList = await prisma.sexItem.findMany();
    if (!sexItemList.length) throw new Error("No sex items found.");
    return sexItemList;
  } catch (error) {
    console.error("Error in fetchSexItemList:", error);
    throw new Error("Failed to fetch sex item list.");
  }
}

export async function fetchAudioDeviceItemList() {
  noStore();
  try {
    const audioDeviceItemList = await prisma.audioDeviceItem.findMany();
    if (!audioDeviceItemList.length) {
      throw new Error("No audio device items found.");
    }
    return audioDeviceItemList;
  } catch (error) {
    console.error("Error in fetchAudioDeviceItemList:", error);
    throw new Error("Failed to fetch audio device item list.");
  }
}

export async function fetchIntelligibilityList() {
  noStore();
  try {
    const intelligibilityItemList = await prisma.intelligibilityItem.findMany();
    if (!intelligibilityItemList.length) {
      throw new Error("No intelligibility items found.");
    }
    return intelligibilityItemList;
  } catch (error) {
    console.error("Error in fetchIntelligibilityList:", error);
    throw new Error("Failed to fetch intelligibility item list.");
  }
}

export async function fetchSimilarityList() {
  noStore();
  try {
    const SimilarityItemList = await prisma.similarityItem.findMany();
    if (!SimilarityItemList.length) {
      throw new Error("No Similarity items found.");
    }
    return SimilarityItemList;
  } catch (error) {
    console.error("Error in fetchSimilarityList:", error);
    throw new Error("Failed to fetch Similarity item list.");
  }
}

export async function fetchSampleMetaDataListShuffledSim(
  numTake: number | undefined,
  expType: string,
) {
  noStore();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated.");

    const respondent = await prisma.respondents.findUnique({
      where: {
        auth_id: user.id,
      },
    });

    if (!respondent) throw new Error("Respondent not found.");

    const sampleMetaDataListEval = await prisma.sampleMetaData.findMany({
      take: numTake,
      where: {
        AND: [
          {
            exp_type: expType,
          },
          {
            file_path: { in: respondent.file_path_list_sim_eval },
          },
        ],
      },
    });

    const sampleMetaDataListGT = await prisma.sampleMetaData.findMany({
      take: numTake,
      where: {
        AND: [
          {
            exp_type: expType,
          },
          {
            file_path: { in: respondent.file_path_list_sim_gt },
          },
        ],
      },
    });

    const sampleMetaDataDummyList = await prisma.sampleMetaData.findMany({
      take: numTake,
      where: {
        AND: [
          {
            exp_type: expType,
          },
          {
            is_dummy: true,
          },
          {
            sample_name: "sim",
          },
        ],
      },
    });

    if (!sampleMetaDataListEval.length || !sampleMetaDataListGT.length) {
      throw new Error(
        `sampleMetaDataListEval: ${sampleMetaDataListEval.length}, sampleMetaDataListGT: ${sampleMetaDataListGT.length}`,
      );
    }

    const sampleMetaDataList: SampleMetaData[][] = [];

    // findManyで取得したサンプルはrespondent.file_path_listと順番が異なる。respondent.file_path_listの順番に出さないと、評価音声に対して正しい原音声ペアが割り当てられないので、ここで並び替える。
    for (
      let i = 0;
      i < respondent.file_path_list_sim_eval.length;
      i += 1
    ) {
      const filePathGTRequired = respondent.file_path_list_sim_gt[i];
      const filePathEvalRequired = respondent.file_path_list_sim_eval[i];

      const sampleMetaDataGT = sampleMetaDataListGT.find((value) =>
        value.file_path === filePathGTRequired
      );
      const sampleMetaDataEval = sampleMetaDataListEval.find((value) =>
        value.file_path === filePathEvalRequired
      );

      if (sampleMetaDataGT !== undefined && sampleMetaDataEval !== undefined) {
        sampleMetaDataList.push([sampleMetaDataEval, sampleMetaDataGT]);
      }
    }

    for (const sampleMetaData of sampleMetaDataDummyList) {
      sampleMetaDataList.push([sampleMetaData, sampleMetaData]);
    }

    return shuffleArray(sampleMetaDataList);
  } catch (error) {
    console.error("Error in fetchSampleMetaDataListShuffledSim:", error);
    throw new Error("Failed to fetch and shuffle sample meta data list.");
  }
}

export async function fetchSampleMetaDataListShuffledInt(
  numTake: number | undefined,
  expType: string,
) {
  noStore();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated.");

    const respondent = await prisma.respondents.findUnique({
      where: {
        auth_id: user.id,
      },
    });

    if (!respondent) throw new Error("Respondent not found.");

    const sampleMetaDataList = await prisma.sampleMetaData.findMany({
      take: numTake,
      where: {
        AND: [
          {
            exp_type: expType,
          },
          {
            OR: [
              {
                file_path: { in: respondent.file_path_list_int },
              },
              {
                AND: [
                  {
                    is_dummy: true,
                  },
                  {
                    sample_name: "int",
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    if (!sampleMetaDataList.length) {
      throw new Error(`sampleMetaDataList: ${sampleMetaDataList.length}`);
    }

    return shuffleArray(sampleMetaDataList);
  } catch (error) {
    console.error("Error in fetchSampleMetaDataListShuffledInt:", error);
    throw new Error("Failed to fetch and shuffle sample meta data list.");
  }
}

export async function fetchDummySampleExampleSim() {
  noStore();
  try {
    const domainName = process.env.GCS_DOMAIN_NAME;
    const bucketName = process.env.GCS_BUCKET_NAME;

    const sampleMetaDataListShuffled = await fetchSampleMetaDataListShuffledSim(
      undefined,
      "practice",
    );

    const sampleMetaDataDummyExample = sampleMetaDataListShuffled.filter(
      (sampleMetaData) => sampleMetaData[0].is_dummy,
    );

    if (sampleMetaDataDummyExample?.length !== 1) {
      throw new Error(
        `sampleMetaDataDummyExample length: ${sampleMetaDataDummyExample?.length}`,
      );
    }

    const dummySampleUrl = `${domainName}/${bucketName}/${
      sampleMetaDataDummyExample[0][0].file_path
    }`;

    const similarityItemList = await fetchSimilarityList();
    const dummySampleAnswer = similarityItemList.find(
      (item) =>
        item.id ===
          sampleMetaDataDummyExample[0][0].similarity_dummy_correct_answer_id,
    );
    if (!dummySampleAnswer) {
      throw new Error("dummySampleAnswer was undefind.");
    }

    return { dummySampleUrl, dummySampleAnswer };
  } catch (error) {
    console.error("Error in fetchDummySampleExampleSim:", error);
    throw new Error("Failed to fetch dummySampleUrl.");
  }
}

export async function fetchDummySampleExampleInt() {
  noStore();
  try {
    const domainName = process.env.GCS_DOMAIN_NAME;
    const bucketName = process.env.GCS_BUCKET_NAME;

    const sampleMetaDataListShuffled = await fetchSampleMetaDataListShuffledInt(
      undefined,
      "practice",
    );

    const sampleMetaDataDummyExample = sampleMetaDataListShuffled.filter(
      (sampleMetaData) => sampleMetaData.is_dummy,
    );

    if (sampleMetaDataDummyExample?.length !== 1) {
      throw new Error(
        `sampleMetaDataDummyExample length: ${sampleMetaDataDummyExample?.length}`,
      );
    }

    const dummySampleUrl = `${domainName}/${bucketName}/${
      sampleMetaDataDummyExample[0].file_path
    }`;

    const intelligibilityItemList = await fetchIntelligibilityList();
    const dummySampleAnswer = intelligibilityItemList.find(
      (item) =>
        item.id ===
          sampleMetaDataDummyExample[0].intelligibility_dummy_correct_answer_id,
    );
    if (!dummySampleAnswer) {
      throw new Error("dummySampleAnswer was undefind.");
    }

    return { dummySampleUrl, dummySampleAnswer };
  } catch (error) {
    console.error("Error in fetchDummySampleExampleInt:", error);
    throw new Error("Failed to fetch dummySampleUrl.");
  }
}
