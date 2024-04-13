/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { prisma } from "@/app/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const supabase = createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user === null) {
      redirect("/login");
    }
    const respondent = await prisma.respondents.findUnique({
      where: {
        auth_id: user.id,
      },
    });
    return Response.json(respondent);
  } catch (error) {
    throw new Error("Failed to fetch naturalness item.");
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  const supabase = createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user === null) {
      redirect("/login");
    }
    await prisma.respondents.update({
      where: {
        auth_id: user?.id,
      },
      data: {
        age: Number(data.age),
        sex: String(data.sex),
        is_finished_info: true,
      },
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: "Respondent Information was updated successfully.",
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
