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
