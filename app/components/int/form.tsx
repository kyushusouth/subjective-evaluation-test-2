/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/media-has-caption */

"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { SampleMetaData, IntelligibilityItem } from "@prisma/client";
import clsx from "clsx";
import * as Yup from "yup";
import createSchema from "@/app/components/int/schema";
import {
  IntelligibilityExplanation,
  DummySampleExplanation,
} from "@/app/components/int/instructions";
import {
  AccordionSection,
  NextPrevButtons,
  ProgressPar,
} from "@/app/components/common/formComponents";
import RadioButton from "@/app/components/int/radioButton";

export default function Form({
  uttVisibles,
  handleUttVisibles,
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
}: {
  uttVisibles: { [key: number]: boolean };
  handleUttVisibles: (sampleId: number) => void;
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
}) {
  const Schema = createSchema(sampleMetaDataList.length);
  type SchemaType = Yup.InferType<typeof Schema>;

  const {
    formState: { isValid },
  } = useFormContext<SchemaType>();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayed, setIsPlayed] = useState(false);

  const handlePlay = () => {
    if (isPlayed) {
      if (!audioRef) {
        // @ts-expect-error: audioRef.currentで出るメッセージは無視
        audioRef.current.pause();
        // @ts-expect-error: audioRef.currentで出るメッセージは無視
        audioRef.current.currentTime = 0;
      }
    } else {
      setIsPlayed(true);
    }
  };

  return (
    <div className="my-10 flex flex-col justify-center items-center gap-10">
      <div id="accordion-open" data-accordion="open" className="w-full">
        <AccordionSection
          sectionNumber={1}
          sectionTitle="明瞭性とは"
          ContentsComponent={<IntelligibilityExplanation />}
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
                  ref={audioRef}
                  src={sampleUrl}
                  controls={!uttVisibles[sampleId]}
                  controlsList="nodownload"
                  className="w-full"
                  onPlay={handlePlay}
                />
                <div>
                  <button
                    type="button"
                    className={clsx("leading-relaxed", {
                      hidden: uttVisibles[sampleId],
                    })}
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
