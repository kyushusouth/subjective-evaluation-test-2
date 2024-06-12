import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  fetchSexItemList,
  fetchAudioDeviceItemList,
  fetchRespondent,
} from "@/app/lib/data";
import Contents from "@/app/info/Contents";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    redirect("/login");
    return null;
  }

  try {
    const sexItemList = await fetchSexItemList();
    const audioDeviceItemList = await fetchAudioDeviceItemList();
    const respondent = await fetchRespondent();

    if (respondent?.is_finished_info) {
      redirect("/");
      return null;
    }

    return (
      <Contents
        sexItemList={sexItemList}
        audioDeviceItemList={audioDeviceItemList}
        respondent={respondent!}
      />
    );
  } catch (error) {
    console.error("Error loading page data:", error);
    redirect("/error");
    return null;
  }
}
