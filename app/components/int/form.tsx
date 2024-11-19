/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/media-has-caption */

"use client";

import { SampleMetaData, IntelligibilityItem } from "@prisma/client";
import * as Yup from "yup";
import clsx from "clsx";
import {
  ExperimentOverviewSection,
  DummySampleExplanation,
} from "@/app/components/int/instructions";
import {
  AccordionSection,
  ProgressPar,
} from "@/app/components/common/formComponents";
import RadioButton from "@/app/components/int/radioButton";
import NextPrevButton from "@/app/components/int/nextPrevButton";

export default function Form({
  uttVisibles,
  handleUttVisibles,
  isPlayedSample,
  handleIsPlayedSample,
  onNext,
  onPrev,
  sampleMetaDataList,
  intelligibilityItemList,
  pageNumber,
  lastPageNumber,
  dummySampleUrl,
  dummySampleAnswer,
  domainName,
  bucketName,
  Schema,
}: {
  uttVisibles: { [key: number]: boolean };
  handleUttVisibles: (sampleId: number) => void;
  isPlayedSample: { [key: number]: boolean };
  handleIsPlayedSample: (sampleId: number) => void;
  onNext: () => void;
  onPrev: () => void;
  sampleMetaDataList: SampleMetaData[];
  intelligibilityItemList: IntelligibilityItem[];
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
              intelligibilityItemList={intelligibilityItemList}
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
          // eslint-disable-next-line react/jsx-boolean-value
          isLast={true}
        />
      </div>

      <div>
        <ul className="flex flex-col justify-center items-center gap-10">
          {sampleMetaDataList.map((data) => {
            const sampleId = data.id;
            const sampleUrl = `${domainName}/${bucketName}/${data.file_path}`;
            const sampleUtt = data.sample_utt;
            return (
              <li
                data-test-id="formItem"
                key={sampleId}
                className="w-72 flex flex-col justify-center items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow"
              >
                <audio
                  src={sampleUrl}
                  controls
                  controlsList="nodownload"
                  preload="auto"
                  className={clsx("w-full", {
                    "pointer-events-none opacity-50":
                      isPlayedSample[sampleId] || uttVisibles[sampleId],
                  })}
                  onEnded={() => handleIsPlayedSample(sampleId)}
                />
                <div>
                  <button
                    type="button"
                    className={clsx(
                      "leading-relaxed bg-slate-500 text-white py-2 px-4 rounded hover:bg-blue-700",
                      {
                        hidden: uttVisibles[sampleId],
                      },
                    )}
                    onClick={() => handleUttVisibles(sampleId)}
                  >
                    発話内容を表示
                  </button>
                </div>
                <p
                  className={clsx("leading-relaxed", {
                    hidden: !uttVisibles[sampleId],
                  })}
                >
                  {sampleUtt}
                </p>
                <div className="flex flex-row justify-between items-center gap-x-16">
                  <RadioButton
                    label="明瞭性"
                    answerItem="intelligibility"
                    sampleId={sampleId}
                    itemList={intelligibilityItemList}
                    disabled={!uttVisibles[sampleId]}
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
