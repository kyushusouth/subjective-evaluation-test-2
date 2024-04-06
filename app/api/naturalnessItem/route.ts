/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const naturalnessItem = await prisma.naturalnessItem.findMany();
    return Response.json(naturalnessItem);
  } catch (error) {
    throw new Error("Failed to fetch naturalness item.");
  }
}
