import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    redirect("/login");
  }

  return (
    <>
      <div>ようこそ</div>
      <div>{user.id}</div>
    </>
  );
}
