/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/dot-notation */
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/app/lib/prisma";
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

    const sampleMetaDataListSynth = await prisma.sampleMetaData.findMany({
      take: numTake,
      where: {
        AND: [
          {
            exp_type: expType,
          },
          {
            file_path: { in: respondent.file_path_list_eval_sim_synth },
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
            file_path: { in: respondent.file_path_list_eval_sim_gt },
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

    if (!sampleMetaDataListSynth.length || !sampleMetaDataListGT.length) {
      throw new Error(
        `sampleMetaDataListSynth: ${sampleMetaDataListSynth.length}, sampleMetaDataListGT: ${sampleMetaDataListGT.length}`,
      );
    }

    const sampleMetaDataList: SampleMetaData[][] = [];

    for (
      let i = 0;
      i < respondent.file_path_list_eval_sim_synth.length;
      i += 1
    ) {
      const filePathGTRequired = respondent.file_path_list_eval_sim_gt[i];
      const filePathSynthRequired = respondent.file_path_list_eval_sim_synth[i];

      const sampleMetaDataGT = sampleMetaDataListGT.find((value) =>
        value.file_path === filePathGTRequired
      );
      const sampleMetaDataSynth = sampleMetaDataListSynth.find((value) =>
        value.file_path === filePathSynthRequired
      );

      if (sampleMetaDataGT !== undefined && sampleMetaDataSynth !== undefined) {
        sampleMetaDataList.push([sampleMetaDataSynth, sampleMetaDataGT]);
      }
    }

    for (const sampleMetaData of sampleMetaDataDummyList) {
      sampleMetaDataList.push([sampleMetaData, sampleMetaData]);
    }

    return shuffleArray(sampleMetaDataList);
  } catch (error) {
    console.error("Error in fetchSampleMetaDataListShuffled:", error);
    throw new Error("Failed to fetch and shuffle sample meta data list.");
  }
}

export async function fetchSampleMetaDataListShuffledIntNat(
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
                file_path: { in: respondent.file_path_list_eval_int_nat },
              },
              {
                AND: [
                  {
                    is_dummy: true,
                  },
                  {
                    sample_name: "intnat",
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
    console.error("Error in fetchSampleMetaDataListShuffled:", error);
    throw new Error("Failed to fetch and shuffle sample meta data list.");
  }
}

export async function fetchDummySampleUrlSim() {
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
      sampleMetaDataDummyExample[0][0]?.file_path
    }`;
    return dummySampleUrl;
  } catch (error) {
    console.error("Error in fetchDummySampleUrlSim:", error);
    throw new Error("Failed to fetch dummySampleUrl.");
  }
}

export async function fetchDummySampleUrlIntNat() {
  noStore();
  try {
    const domainName = process.env.GCS_DOMAIN_NAME;
    const bucketName = process.env.GCS_BUCKET_NAME;

    const sampleMetaDataListShuffled =
      await fetchSampleMetaDataListShuffledIntNat(undefined, "practice");

    const sampleMetaDataDummyExample = sampleMetaDataListShuffled.filter(
      (sampleMetaData) => sampleMetaData.is_dummy,
    );

    if (sampleMetaDataDummyExample?.length !== 1) {
      throw new Error(
        `sampleMetaDataDummyExample length: ${sampleMetaDataDummyExample?.length}`,
      );
    }

    const dummySampleUrl = `${domainName}/${bucketName}/${
      sampleMetaDataDummyExample[0]?.file_path
    }`;
    return dummySampleUrl;
  } catch (error) {
    console.error("Error in fetchDummySampleUrlIntNat:", error);
    throw new Error("Failed to fetch dummySampleUrl.");
  }
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

export async function fetchNaturalnessItemList() {
  noStore();
  try {
    const naturalnessItemList = await prisma.naturalnessItem.findMany();
    if (!naturalnessItemList.length) {
      throw new Error("No naturalness items found.");
    }
    return naturalnessItemList;
  } catch (error) {
    console.error("Error in fetchNaturalnessItemList:", error);
    throw new Error("Failed to fetch naturalness item list.");
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
