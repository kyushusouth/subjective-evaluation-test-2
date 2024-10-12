import Contents from "@/app/components/sim/contents";
import {
  fetchSampleMetaDataListShuffledSim,
  fetchDummySampleUrlSim,
  fetchSimilarityList,
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
  const sampleMetaDataListShuffled = await fetchSampleMetaDataListShuffledSim(
    undefined,
    expType,
  );
  const similarityItemList = await fetchSimilarityList();
  const respondent = await fetchRespondent();
  const dummySampleUrl = await fetchDummySampleUrlSim();

  return (
    <Contents
      sampleMetaDataList={sampleMetaDataListShuffled}
      similarityItemList={similarityItemList}
      respondent={respondent!}
      numSamplePerPage={numSamplePerPage}
      dummySampleUrl={dummySampleUrl}
      domainName={domainName!}
      bucketName={bucketName!}
    />
  );
}
