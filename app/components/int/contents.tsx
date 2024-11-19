/* eslint-disable object-shorthand */
/* eslint-disable no-restricted-syntax */

"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  SampleMetaData,
  IntelligibilityItem,
  Respondents,
} from "@prisma/client";
import Form from "@/app/components/int/form";
import Confirm from "@/app/components/int/confirm";
import createSchema from "@/app/components/int/schema";
import * as Yup from "yup";

export default function Contents({
  sampleMetaDataList,
  intelligibilityItemList,
  respondent,
  numSamplePerPage,
  dummySampleUrl,
  dummySampleAnswer,
  domainName,
  bucketName,
  localStorageKey,
}: {
  sampleMetaDataList: SampleMetaData[];
  intelligibilityItemList: IntelligibilityItem[];
  respondent: Respondents;
  numSamplePerPage: number;
  dummySampleUrl: string;
  dummySampleAnswer: { id: number; item: string };
  domainName: string;
  bucketName: string;
  localStorageKey: string;
}) {
  const Schema = createSchema(sampleMetaDataList);
  type SchemaType = Yup.InferType<typeof Schema>;

  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldSave, setShouldSave] = useState(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [uttVisibles, setUttVisibles] = useState<{ [key: number]: boolean }>(
    {},
  );
  const [isPlayedSample, setIsPlayedSample] = useState<{
    [key: number]: boolean;
  }>({});
  const methods = useForm<SchemaType>({
    mode: "onSubmit",
  });
  const { handleSubmit, watch, reset } = methods;
  const formValues = watch();
  const router = useRouter();
  const lastPageNumber = Math.ceil(
    sampleMetaDataList.length / numSamplePerPage,
  );

  useEffect(() => {
    const uttVisiblesDefaultValue: { [key: number]: boolean } = {};
    const isPlayedSampleDefaultValue: { [key: number]: boolean } = {};
    for (const sampleMetaData of sampleMetaDataList) {
      uttVisiblesDefaultValue[sampleMetaData.id] = false;
      isPlayedSampleDefaultValue[sampleMetaData.id] = false;
    }

    const savedData = localStorage.getItem(localStorageKey);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      reset(parsedData);

      for (const [sampleId, answer] of Object.entries(parsedData)) {
        if (answer) {
          uttVisiblesDefaultValue[Number(sampleId.split("_")[1])] = true;
          isPlayedSampleDefaultValue[Number(sampleId.split("_")[1])] = true;
        }
      }
    }

    setUttVisibles(uttVisiblesDefaultValue);
    setIsPlayedSample(isPlayedSampleDefaultValue);
    setIsLoaded(true);
  }, [localStorageKey, reset, sampleMetaDataList]);

  useEffect(() => {
    if (isLoaded && shouldSave) {
      localStorage.setItem(localStorageKey, JSON.stringify(formValues));
    }
  }, [formValues, isLoaded, localStorageKey, shouldSave]);

  const handleUttVisibles = (sampleId: number) => {
    setUttVisibles({
      ...uttVisibles,
      [sampleId]: true,
    });
  };

  const handleIsPlayedSample = (sampleId: number) => {
    setIsPlayedSample({
      ...isPlayedSample,
      [sampleId]: true,
    });
  };

  const onNext = () => {
    setPageNumber((state) => state + 1);
    window.scrollTo(0, 0);
  };

  const onPrev = () => {
    setPageNumber((state) => state - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: SchemaType) => {
    const dataList = [];
    for (const sampleMetaData of sampleMetaDataList) {
      const sampleId = Number(sampleMetaData.id);
      const intelligibility = Number(data[`intelligibility_${sampleId}`]);
      dataList.push({
        respondent_id: respondent.id,
        sample_meta_data_id: sampleId,
        intelligibility_id: intelligibility,
      });
    }

    const response = await fetch("/api/answers_int", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataList),
      method: "POST",
    });

    const result = await response.json();
    if (result.success) {
      setShouldSave(false);
      localStorage.removeItem(localStorageKey);
      router.push("/thanks");
    } else {
      router.push("/error");
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {pageNumber === lastPageNumber + 1 ? (
          <Confirm onPrev={onPrev} Schema={Schema} />
        ) : (
          <Form
            uttVisibles={uttVisibles}
            handleUttVisibles={handleUttVisibles}
            isPlayedSample={isPlayedSample}
            handleIsPlayedSample={handleIsPlayedSample}
            onNext={onNext}
            onPrev={onPrev}
            sampleMetaDataList={sampleMetaDataList.slice(
              numSamplePerPage * (pageNumber - 1),
              numSamplePerPage * pageNumber,
            )}
            intelligibilityItemList={intelligibilityItemList}
            pageNumber={pageNumber}
            lastPageNumber={lastPageNumber}
            dummySampleUrl={dummySampleUrl}
            dummySampleAnswer={dummySampleAnswer}
            domainName={domainName}
            bucketName={bucketName}
            Schema={Schema}
          />
        )}
      </form>
    </FormProvider>
  );
}
