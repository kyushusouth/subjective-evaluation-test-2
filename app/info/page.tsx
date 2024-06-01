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
  }

  const sexItemList = await fetchSexItemList();
  const audioDeviceItemList = await fetchAudioDeviceItemList();
  const respondent = await fetchRespondent();

  return (
    <Contents
      sexItemList={sexItemList}
      audioDeviceItemList={audioDeviceItemList}
      respondent={respondent!}
    />
  );
}
