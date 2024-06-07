/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/dot-notation */
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { createClient } from "@/utils/supabase/server";

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export async function fetchSampleMetaDataListShuffled(
  numTake: number | undefined,
  samplePageName: string,
) {
  noStore();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const respondent = await prisma.respondents.findUnique({
      where: {
        auth_id: user?.id,
      },
    });

    const sampleMetaDataList = await prisma.sampleMetaData.findMany({
      take: numTake,
      where: {
        OR: [
          {
            sample_page_name: samplePageName,
            file_path: {
              in: respondent?.file_path_list,
            },
          },
          {
            sample_page_name: samplePageName,
            is_dummy: true,
          },
        ],
      },
    });
    const sampleMetaDataListShuffled = shuffleArray(sampleMetaDataList);
    return sampleMetaDataListShuffled;
  } catch (error) {
    throw new Error("Failed to fetch sampleMetaDataListShuffled.");
  }
}

export async function fetchRespondent() {
  noStore();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const respondent = await prisma.respondents.findUnique({
      where: {
        auth_id: user?.id,
      },
    });
    return respondent;
  } catch (error) {
    throw new Error("Failed to fetch respondent.");
  }
}

export async function fetchSexItemList() {
  noStore();
  try {
    const sexItemList = await prisma.sexItem.findMany();
    return sexItemList;
  } catch (error) {
    throw new Error("Failed to fetch sexItemList.");
  }
}

export async function fetchAudioDeviceItemList() {
  noStore();
  try {
    const audioDeviceItemList = await prisma.audioDeviceItem.findMany();
    return audioDeviceItemList;
  } catch (error) {
    throw new Error("Failed to fetch audioDeviceItemList.");
  }
}

export async function fetchNaturalnessItemList() {
  noStore();
  try {
    const naturalnessItemList = await prisma.naturalnessItem.findMany();
    return naturalnessItemList;
  } catch (error) {
    throw new Error("Failed to fetch naturalnessItemList.");
  }
}

export async function fetchIntelligibilityList() {
  noStore();
  try {
    const intelligibilityItemList = await prisma.intelligibilityItem.findMany();
    return intelligibilityItemList;
  } catch (error) {
    throw new Error("Failed to fetch intelligibilityItemList.");
  }
}
