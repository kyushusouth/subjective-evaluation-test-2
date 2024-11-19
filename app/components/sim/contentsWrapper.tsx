import Contents from "@/app/components/sim/contents";
import {
  fetchSampleMetaDataListShuffledSim,
  fetchDummySampleExampleSim,
  fetchSimilarityList,
  fetchRespondent,
} from "@/app/lib/data";

export default async function ContentsWrapper({
  expType,
}: {
  expType: string;
}) {
  const localStorageKey = `subjectiveEvaluationTestSimilarityFormValues_${expType}`;
  const domainName = process.env.GCS_DOMAIN_NAME;
  const bucketName = process.env.GCS_BUCKET_NAME;
  const numSamplePerPage = 1;
  const sampleMetaDataListShuffled = await fetchSampleMetaDataListShuffledSim(
    undefined,
    expType,
  );
  const similarityItemList = await fetchSimilarityList();
  const respondent = await fetchRespondent();
  const { dummySampleUrl, dummySampleAnswer } =
    await fetchDummySampleExampleSim();

  return (
    <Contents
      sampleMetaDataList={sampleMetaDataListShuffled}
      similarityItemList={similarityItemList}
      respondent={respondent!}
      numSamplePerPage={numSamplePerPage}
      dummySampleUrl={dummySampleUrl}
      dummySampleAnswer={dummySampleAnswer}
      domainName={domainName!}
      bucketName={bucketName!}
      localStorageKey={localStorageKey}
    />
  );
}
