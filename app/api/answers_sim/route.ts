/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import { createClient } from "@/utils/supabase/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const answerList = await request.json();
    const fromUrl = request.headers.get("referer")!;
    const fromUrlSplit = fromUrl.split("/");
    const pageName = fromUrlSplit[fromUrlSplit.length - 2];

    const expType = pageName.split("_")[1];

    const sampleMetaDataDummyList = await prisma.sampleMetaData.findMany({
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

    let isInvalid = false;
    for (const answer of answerList) {
      for (const sampleMetaDataDummy of sampleMetaDataDummyList) {
        if (
          answer.sample_meta_data_id === sampleMetaDataDummy.id &&
          (answer.similarity_id !==
            sampleMetaDataDummy.similarity_dummy_correct_answer_id)
        ) {
          isInvalid = true;
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.answersSim.createMany({
        data: answerList,
        skipDuplicates: true,
      });

      if (expType === "practice") {
        await tx.respondents.update({
          where: {
            auth_id: user!.id,
          },
          data: {
            is_finished_sim_practice: true,
          },
        });
      } else if (expType === "main") {
        await tx.respondents.update({
          where: {
            auth_id: user!.id,
          },
          data: {
            is_finished_sim_main: true,
            is_invalid: isInvalid,
          },
        });
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error occurred during transaction:", error);
    return new Response(JSON.stringify({ success: false }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
