/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
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

export async function GET(request: Request) {
  try {
    const sampleMetaDataList = await prisma.sampleMetaData.findMany({
      take: 30,
    });
    const sampleMetaDataListShuffled = shuffleArray(sampleMetaDataList);
    return Response.json(sampleMetaDataListShuffled);
  } catch (error) {
    throw new Error("Failed to fetch all wav files.");
  }
}
