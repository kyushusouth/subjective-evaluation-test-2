/* eslint-disable import/prefer-default-export */
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  const answersData = await request.json();
  try {
    await prisma.answers.createMany({
      data: answersData,
      skipDuplicates: true,
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: "Answers created successfully.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Failed to create Answers." }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
