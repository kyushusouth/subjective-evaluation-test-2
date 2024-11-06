/* eslint-disable react/jsx-boolean-value */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/media-has-caption */

"use client";

import { useFormContext } from "react-hook-form";
// import { useState, useEffect } from "react";
import { SampleMetaData, SimilarityItem } from "@prisma/client";
import createSchema from "@/app/components/sim/schema";
import {
  SimilarityExplanation,
  DummySampleExplanation,
} from "@/app/components/sim/instructions";
import {
  AccordionSection,
  RadioButton,
  NextPrevButtons,
  ProgressPar,
} from "@/app/components/common/formComponents";
import * as Yup from "yup";

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
}) {
  const Schema = createSchema(sampleMetaDataList.length);
  type SchemaType = Yup.InferType<typeof Schema>;

  const {
    formState: { isValid },
  } = useFormContext<SchemaType>();

  // const [randValobj, setRandValObj] = useState<{ [key: number]: number }>({});

  // useEffect(() => {
  //   if (!(pageNumber in randValobj)) {
  //     const newRandVal = Math.random() < 0.5 ? 0 : 1;
  //     setRandValObj((prevRandValobj) => ({
  //       ...prevRandValobj,
  //       [pageNumber]: newRandVal,
  //     }));
  //   }
  // }, [pageNumber, randValobj]);

  // const currentRandVal = randValobj[pageNumber];

  return (
    <div className="my-10 flex flex-col justify-center items-center gap-10">
      <div id="accordion-open" data-accordion="open" className="w-full">
        <AccordionSection
          sectionNumber={1}
          sectionTitle="類似性とは"
          ContentsComponent={<SimilarityExplanation />}
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
                    className="w-full min-w-64"
                  />
                </div>
                <div className="flex flex-row justify-between items-center gap-x-16 min-w-64">
                  <RadioButton
                    label="類似性"
                    answerItem="similarity"
                    sampleId={sampleEvalId}
                    itemList={similarityItemList}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <NextPrevButtons
        onNext={onNext}
        onPrev={onPrev}
        pageNumber={pageNumber}
        isValid={isValid}
      />

      <ProgressPar pageNumber={pageNumber} lastPageNumber={lastPageNumber} />
    </div>
  );
}
