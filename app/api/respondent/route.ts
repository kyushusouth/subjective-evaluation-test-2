/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
import { prisma } from "@/app/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const data = await request.json();
  const supabase = createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await prisma.respondents.update({
      where: {
        auth_id: user?.id,
      },
      data: {
        age: Number(data.age),
        sex: String(data.sex),
        audio_device: String(data.audio_device),
        is_finished_info: true,
      },
    });
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
