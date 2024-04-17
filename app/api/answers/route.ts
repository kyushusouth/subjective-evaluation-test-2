/* eslint-disable import/prefer-default-export */
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const answersData = await request.json();
    const fromUrl = request.headers.get("referer")!;
    const fromUrlSplit = fromUrl.split("/");
    const pageName = fromUrlSplit[fromUrlSplit.length - 1];
    await prisma.answers.createMany({
      data: answersData,
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
    } else if (pageName === "eval") {
      await prisma.respondents.update({
        where: {
          auth_id: user!.id,
        },
        data: {
          is_finished_eval: true,
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
