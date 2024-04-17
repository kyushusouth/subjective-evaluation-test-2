import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { SampleMetaData } from "@prisma/client";

const shuffleArray = (array: SampleMetaData[]) => {
  const cloneArray = [...array];
  for (let i = cloneArray.length - 1; i >= 0; i -= 1) {
    const rand = Math.floor(Math.random() * (i + 1));
    const tmpStorage = cloneArray[i];
    cloneArray[i] = cloneArray[rand];
    cloneArray[rand] = tmpStorage;
  }
  return cloneArray;
};

export async function fetchSampleMetaDataListShuffled(
  numTake: number | undefined,
  page_name: string,
) {
  noStore();
  try {
    const sampleMetaDataList = await prisma.sampleMetaData.findMany({
      take: numTake,
      where: {
        page_name,
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
