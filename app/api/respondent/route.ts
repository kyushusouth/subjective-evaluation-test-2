/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { prisma } from "@/app/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const data = await request.json();
  const supabase = createClient();
  try {
    throw new Error();
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
      JSON.stringify({
        success: false,
        message: "Failed to update Respondents.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
