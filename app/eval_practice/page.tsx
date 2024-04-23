import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Contents from "@/app/eval/Contents";
import {
  fetchSampleMetaDataListShuffled,
  fetchNaturalnessItemList,
  fetchIntelligibilityList,
  fetchRespondent,
} from "@/app/lib/data";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    redirect("/login");
  }

  const numSamplePerPage = 5;
  const sampleMetaDataListShuffled = await fetchSampleMetaDataListShuffled(
    10,
    "eval_practice",
  );
  const naturalnessItemList = await fetchNaturalnessItemList();
  const intelligibilityItemList = await fetchIntelligibilityList();
  const respondent = await fetchRespondent();
  const domainName = process.env.GCS_DOMAIN_NAME;
  const bucketName = process.env.GCS_BUCKET_NAME;

  return (
    <Contents
      sampleMetaDataList={sampleMetaDataListShuffled}
      domainName={domainName!}
      bucketName={bucketName!}
      naturalnessItemList={naturalnessItemList}
      intelligibilityItemList={intelligibilityItemList}
      respondent={respondent!}
      numSamplePerPage={numSamplePerPage}
    />
  );
}
