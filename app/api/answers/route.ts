/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const answerList = await request.json();
    const fromUrl = request.headers.get("referer")!;
    const fromUrlSplit = fromUrl.split("/");
    const pageName = fromUrlSplit[fromUrlSplit.length - 1];

    const sampleMetaDataDummyList = await prisma.sampleMetaData.findMany({
      where: {
        is_dummy: true,
      },
    });
    let isInvalid = false;
    for (const answer of answerList) {
      for (const sampleMetaDataDummy of sampleMetaDataDummyList) {
        if (
          answer.id === sampleMetaDataDummy.id &&
          (answer.naturalnessId !==
            sampleMetaDataDummy.naturalness_dummy_correct_answer_id ||
            answer.intellibilityId !==
              sampleMetaDataDummy.intelligibility_dummy_correct_answer_id)
        ) {
          isInvalid = true;
        }
      }
    }

    await prisma.answers.createMany({
      data: answerList,
      skipDuplicates: true,
    });

    if (pageName === "eval_practice") {
      await prisma.respondents.update({
        where: {
          auth_id: user!.id,
        },
        data: {
          is_finished_practice: true,
        },
      });
    } else if (pageName === "eval_1") {
      await prisma.respondents.update({
        where: {
          auth_id: user!.id,
        },
        data: {
          is_finished_eval_1: true,
          is_invalid: isInvalid,
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
