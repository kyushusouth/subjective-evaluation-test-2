/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const intelligibilityItem = await prisma.intelligibilityItem.findMany();
    return Response.json(intelligibilityItem);
  } catch (error) {
    throw new Error("Failed to fetch intelligibility item.");
  }
}
