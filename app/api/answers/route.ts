/* eslint-disable import/prefer-default-export */
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    redirect("/login");
  }

  const answersData = await request.json();
  const fromUrl = request.headers.get("referer")!;
  const fromUrlSplit = fromUrl.split("/");
  const pageName = fromUrlSplit[fromUrlSplit.length - 1];

  try {
    await prisma.answers.createMany({
      data: answersData,
      skipDuplicates: true,
    });

    if (pageName === "eval_practice") {
      await prisma.respondents.update({
        where: {
          auth_id: user.id,
        },
        data: {
          is_finished_practice: true,
        },
      });
    } else if (pageName === "eval") {
      await prisma.respondents.update({
        where: {
          auth_id: user.id,
        },
        data: {
          is_finished_eval: true,
        },
      });
    }

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
