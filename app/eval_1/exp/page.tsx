/* eslint-disable no-restricted-syntax */
import { redirect } from "next/navigation";
import Contents from "@/app/eval/Contents";
import {
  fetchSampleMetaDataListShuffled,
  fetchNaturalnessItemList,
  fetchIntelligibilityList,
  fetchRespondent,
} from "@/app/lib/data";

export default async function Page() {
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

  if (!domainName || !bucketName) {
    console.error("環境変数が定義されていません");
    redirect("/error"); // エラーページにリダイレクト
    return null;
  }

  const sampleMetaDataListShuffledForDummy =
    await fetchSampleMetaDataListShuffled(undefined, "eval_practice");
  const sampleMetaDataDummyExample = sampleMetaDataListShuffledForDummy.find(
    (sampleMetaData) => sampleMetaData.is_dummy,
  );

  return (
    <Contents
      sampleMetaDataList={sampleMetaDataListShuffled}
      domainName={domainName}
      bucketName={bucketName}
      naturalnessItemList={naturalnessItemList}
      intelligibilityItemList={intelligibilityItemList}
      respondent={respondent!}
      numSamplePerPage={numSamplePerPage}
      sampleMetaDataDummyExample={sampleMetaDataDummyExample!}
    />
  );
}
