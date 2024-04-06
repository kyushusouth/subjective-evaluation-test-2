/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { fetchAllwavFiles } from "@/app/lib/data";

export async function GET(request: Request) {
  const sampleMetaDataList = await fetchAllwavFiles();
  return Response.json(sampleMetaDataList);
}
