import Contents from "@/app/components/int/contents";
import {
  fetchSampleMetaDataListShuffledInt,
  fetchDummySampleExampleInt,
  fetchIntelligibilityList,
  fetchRespondent,
} from "@/app/lib/data";

export default async function ContentsWrapper({
  expType,
}: {
  expType: string;
}) {
  const localStorageKey = `subjectiveEvaluationTestIntelligibilityFormValues_${expType}`;
  const domainName = process.env.GCS_DOMAIN_NAME;
  const bucketName = process.env.GCS_BUCKET_NAME;
  const numSamplePerPage = 1;
  const sampleMetaDataListShuffled = await fetchSampleMetaDataListShuffledInt(
    undefined,
    expType,
  );
  const intelligibilityItemList = await fetchIntelligibilityList();
  const respondent = await fetchRespondent();
  const { dummySampleUrl, dummySampleAnswer } =
    await fetchDummySampleExampleInt();

  return (
    <Contents
      sampleMetaDataList={sampleMetaDataListShuffled}
      intelligibilityItemList={intelligibilityItemList}
      respondent={respondent}
      numSamplePerPage={numSamplePerPage}
      dummySampleUrl={dummySampleUrl}
      dummySampleAnswer={dummySampleAnswer}
      domainName={domainName!}
      bucketName={bucketName!}
      localStorageKey={localStorageKey}
    />
  );
}
