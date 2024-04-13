"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function redirectToHome() {
  // キャッシュを削除することで、is_finished_*によるUIの変更を可能にする
  revalidatePath("/", "layout");
  redirect("/");
}
