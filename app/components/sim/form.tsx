/* eslint-disable react/jsx-boolean-value */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/media-has-caption */

"use client";

import { SampleMetaData, SimilarityItem } from "@prisma/client";
import * as Yup from "yup";
import {
  ExperimentOverviewSection,
  DummySampleExplanation,
} from "@/app/components/sim/instructions";
import {
  AccordionSection,
  ProgressPar,
} from "@/app/components/common/formComponents";
import RadioButton from "@/app/components/sim/radioButton";
import NextPrevButton from "@/app/components/sim/nextPrevButton";

export default function Form({
  onNext,
  onPrev,
  sampleMetaDataList,
  similarityItemList,
  pageNumber,
  lastPageNumber,
  dummySampleUrl,
  dummySampleAnswer,
  domainName,
  bucketName,
  Schema,
}: {
  onNext: () => void;
  onPrev: () => void;
  sampleMetaDataList: SampleMetaData[][];
  similarityItemList: SimilarityItem[];
  pageNumber: number;
  lastPageNumber: number;
  dummySampleUrl: string;
  dummySampleAnswer: { id: number; item: string };
  domainName: string;
  bucketName: string;
  Schema: Yup.ObjectSchema<
    {
      [x: string]: string | undefined;
    },
    Yup.AnyObject,
    {
      [x: string]: undefined;
    },
    ""
  >;
}) {
  return (
    <div className="my-10 flex flex-col justify-center items-center gap-10">
      <div id="accordion-open" data-accordion="open" className="w-full">
        <AccordionSection
          sectionNumber={1}
          sectionTitle="実験内容"
          ContentsComponent={
            <ExperimentOverviewSection
              similarityItemList={similarityItemList}
            />
          }
          isLast={false}
        />
        <AccordionSection
          sectionNumber={2}
          sectionTitle="ダミー音声について"
          ContentsComponent={
            <DummySampleExplanation
              dummySampleUrl={dummySampleUrl}
              dummySampleAnswer={dummySampleAnswer}
            />
          }
          isLast={true}
        />
      </div>

      <div>
        <ul className="flex flex-col justify-center items-center gap-10">
          {sampleMetaDataList.map((data) => {
            const sampleEvalId = data[0].id;
            const sampleEvalUrl = `${domainName}/${bucketName}/${data[0].file_path}`;
            const sampleGTUrl = `${domainName}/${bucketName}/${data[1].file_path}`;
            return (
              <li
                data-test-id="formItem"
                key={sampleEvalId}
                className="flex flex-col justify-center items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow"
              >
                <div className="flex flex-col justify-center items-center gap-2">
                  <label htmlFor={`ground-truth-${sampleEvalId}`}>原音声</label>
                  <audio
                    id={`ground-truth-${sampleEvalId}`}
                    src={sampleGTUrl}
                    controls
                    controlsList="nodownload"
                    preload="auto"
                    className="w-full min-w-64"
                  />
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <label htmlFor={`eval-${sampleEvalId}`}>評価対象音声</label>
                  <audio
                    id={`eval-${sampleEvalId}`}
                    src={sampleEvalUrl}
                    controls
                    controlsList="nodownload"
                    preload="auto"
                    className="w-full min-w-64"
                  />
                </div>
                <div className="flex flex-row justify-between items-center gap-x-16 min-w-64">
                  <RadioButton
                    label="類似性"
                    answerItem="similarity"
                    sampleId={sampleEvalId}
                    itemList={similarityItemList}
                    Schema={Schema}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <NextPrevButton
        onNext={onNext}
        onPrev={onPrev}
        pageNumber={pageNumber}
        Schema={Schema}
      />

      <ProgressPar pageNumber={pageNumber} lastPageNumber={lastPageNumber} />
    </div>
  );
}
