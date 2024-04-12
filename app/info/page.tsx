import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { fetchSexItemList, fetchRespondent } from "@/app/lib/data";
import Contents from "@/app/info/Contents";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    redirect("/login");
  }

  const sexItemList = await fetchSexItemList();
  const respondent = await fetchRespondent();

  return <Contents sexItemList={sexItemList} respondent={respondent!} />;
}
