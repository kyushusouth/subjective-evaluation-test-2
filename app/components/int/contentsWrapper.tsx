import Contents from "@/app/components/int/contents";
import {
  fetchSampleMetaDataListShuffledIntNat,
  fetchDummySampleUrlIntNat,
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
  const numSamplePerPage = 1;
  const sampleMetaDataListShuffled =
    await fetchSampleMetaDataListShuffledIntNat(undefined, expType, "int");
  const intelligibilityItemList = await fetchIntelligibilityList();
  const respondent = await fetchRespondent();
  const dummySampleUrl = await fetchDummySampleUrlIntNat("int");

  return (
    <Contents
      sampleMetaDataList={sampleMetaDataListShuffled}
      intelligibilityItemList={intelligibilityItemList}
      respondent={respondent!}
      numSamplePerPage={numSamplePerPage}
      dummySampleUrl={dummySampleUrl}
      domainName={domainName!}
      bucketName={bucketName!}
    />
  );
}
