/* eslint-disable no-restricted-syntax */
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
    undefined,
    "eval_1",
  );
  const naturalnessItemList = await fetchNaturalnessItemList();
  const intelligibilityItemList = await fetchIntelligibilityList();
  const respondent = await fetchRespondent();
  const domainName = process.env.GCS_DOMAIN_NAME;
  const bucketName = process.env.GCS_BUCKET_NAME;

  const sampleMetaDataListShuffledForDummy =
    await fetchSampleMetaDataListShuffled(undefined, "eval_practice");
  let sampleMetaDataDummyExample;
  for (const sampleMetaData of sampleMetaDataListShuffledForDummy) {
    if (sampleMetaData.is_dummy) {
      sampleMetaDataDummyExample = sampleMetaData;
    }
  }

  return (
    <Contents
      sampleMetaDataList={sampleMetaDataListShuffled}
      domainName={domainName!}
      bucketName={bucketName!}
      naturalnessItemList={naturalnessItemList}
      intelligibilityItemList={intelligibilityItemList}
      respondent={respondent!}
      numSamplePerPage={numSamplePerPage}
      sampleMetaDataDummyExample={sampleMetaDataDummyExample!}
    />
  );
}
