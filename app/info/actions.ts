"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export default async function createInfo(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rawFormData = {
    age: Number(formData.get("age")),
    sex: String(formData.get("sex")),
  };

  try {
    await prisma.respondents.update({
      where: {
        auth_id: user?.id,
      },
      data: {
        age: rawFormData.age,
        sex: rawFormData.sex,
      },
    });
  } catch (error) {
    throw new Error("Failed to submit.");
  }
  redirect("/");
}
