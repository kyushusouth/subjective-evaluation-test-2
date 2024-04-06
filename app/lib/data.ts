import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/app/lib/prisma";

const shuffleArray = (array: object[]) => {
  const cloneArray = [...array];
  for (let i = cloneArray.length - 1; i >= 0; i -= 1) {
    const rand = Math.floor(Math.random() * (i + 1));
    const tmpStorage = cloneArray[i];
    cloneArray[i] = cloneArray[rand];
    cloneArray[rand] = tmpStorage;
  }
  return cloneArray;
};

export async function fetchSexItemList() {
  noStore();
  try {
    const sexItemList = await prisma.sexItem.findMany();
    return sexItemList;
  } catch (error) {
    throw new Error("Failed to fetch all sex items.");
  }
}

export async function fetchAllwavFiles() {
  noStore();
  try {
    const sampleMetaDataList = await prisma.sampleMetaData.findMany({
      take: 3,
    });
    const sampleMetaDataListShuffled = shuffleArray(sampleMetaDataList);
    return sampleMetaDataListShuffled;
  } catch (error) {
    throw new Error("Failed to fetch all wav files.");
  }
}
