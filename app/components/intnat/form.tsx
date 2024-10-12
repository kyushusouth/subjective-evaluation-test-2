/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/media-has-caption */

"use client";

import { useFormContext } from "react-hook-form";
import {
  SampleMetaData,
  NaturalnessItem,
  IntelligibilityItem,
} from "@prisma/client";
import createSchema from "@/app/components/intnat/schema";
import {
  IntelligibilityExplanation,
  NaturalnessExplanation,
  DummySampleExplanation,
} from "@/app/components/intnat/instructions";
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
  naturalnessItemList,
  intelligibilityItemList,
  pageNumber,
  lastPageNumber,
  dummySampleUrl,
  domainName,
  bucketName,
}: {
  onNext: () => void;
  onPrev: () => void;
  sampleMetaDataList: SampleMetaData[];
  naturalnessItemList: NaturalnessItem[];
  intelligibilityItemList: IntelligibilityItem[];
  pageNumber: number;
  lastPageNumber: number;
  dummySampleUrl: string;
  domainName: string;
  bucketName: string;
}) {
  const Schema = createSchema(sampleMetaDataList.length);
  type SchemaType = Yup.InferType<typeof Schema>;

  const methods = useFormContext<SchemaType>();
  const {
    register,
    formState: { isValid },
  } = methods;

  console.log(typeof register);

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
          sectionTitle="自然性とは"
          ContentsComponent={<NaturalnessExplanation />}
          isLast={false}
        />
        <AccordionSection
          sectionNumber={3}
          sectionTitle="ダミー音声について"
          ContentsComponent={
            <DummySampleExplanation dummySampleUrl={dummySampleUrl} />
          }
          isLast={true}
        />
      </div>

      <div>
        <ul className="flex flex-col justify-center items-center gap-10">
          {sampleMetaDataList.map((data) => {
            const sampleId = data.id;
            const sampleUrl = `${domainName}/${bucketName}/${data.file_path}`;
            return (
              <li
                data-test-id="formItem"
                key={sampleId}
                className="flex flex-col justify-center items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow"
              >
                <audio
                  src={sampleUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full"
                />
                <div className="flex flex-row justify-between items-center gap-x-16">
                  <RadioButton
                    label="明瞭性"
                    answerItem="intelligibility"
                    sampleId={sampleId}
                    itemList={intelligibilityItemList}
                    register={register}
                  />
                  <RadioButton
                    label="自然性"
                    answerItem="naturalness"
                    sampleId={sampleId}
                    itemList={naturalnessItemList}
                    register={register}
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
