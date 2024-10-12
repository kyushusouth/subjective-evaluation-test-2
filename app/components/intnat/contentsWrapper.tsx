import Contents from "@/app/components/intnat/contents";
import {
  fetchSampleMetaDataListShuffledIntNat,
  fetchDummySampleUrlIntNat,
  fetchNaturalnessItemList,
  fetchIntelligibilityList,
  fetchRespondent,
} from "@/app/lib/data";

export default async function ContentsWrapper({
  expType,
}: {
  expType: string;
}) {
  const domainName = process.env.GCS_DOMAIN_NAME;
  const bucketName = process.env.GCS_BUCKET_NAME;
  const numSamplePerPage = 5;
  const sampleMetaDataListShuffled =
    await fetchSampleMetaDataListShuffledIntNat(undefined, expType);
  const naturalnessItemList = await fetchNaturalnessItemList();
  const intelligibilityItemList = await fetchIntelligibilityList();
  const respondent = await fetchRespondent();
  const dummySampleUrl = await fetchDummySampleUrlIntNat();

  return (
    <Contents
      sampleMetaDataList={sampleMetaDataListShuffled}
      naturalnessItemList={naturalnessItemList}
      intelligibilityItemList={intelligibilityItemList}
      respondent={respondent!}
      numSamplePerPage={numSamplePerPage}
      dummySampleUrl={dummySampleUrl}
      domainName={domainName!}
      bucketName={bucketName!}
    />
  );
}
