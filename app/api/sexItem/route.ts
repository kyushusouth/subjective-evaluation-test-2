/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */

import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const sexItemList = await prisma.sexItem.findMany();
    return Response.json(sexItemList);
  } catch (error) {
    throw new Error("Failed to fetch all sex items.");
  }
}
