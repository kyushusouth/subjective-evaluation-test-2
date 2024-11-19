/* eslint-disable no-restricted-syntax */

"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SampleMetaData, SimilarityItem, Respondents } from "@prisma/client";
import Form from "@/app/components/sim/form";
import Confirm from "@/app/components/sim/confirm";
import createSchema from "@/app/components/sim/schema";
import * as Yup from "yup";

export default function Contents({
  sampleMetaDataList,
  similarityItemList,
  respondent,
  numSamplePerPage,
  dummySampleUrl,
  dummySampleAnswer,
  domainName,
  bucketName,
  localStorageKey,
}: {
  sampleMetaDataList: SampleMetaData[][];
  similarityItemList: SimilarityItem[];
  respondent: Respondents | undefined;
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
    const savedData = localStorage.getItem(localStorageKey);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      reset(parsedData);
    }

    setIsLoaded(true);
  }, [localStorageKey, reset]);

  useEffect(() => {
    if (isLoaded && shouldSave) {
      localStorage.setItem(localStorageKey, JSON.stringify(formValues));
    }
  }, [formValues, isLoaded, localStorageKey, shouldSave]);

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
      const sampleId = Number(sampleMetaData[0].id);
      const similarity = Number(data[`similarity_${sampleId}`]);
      dataList.push({
        respondent_id: respondent?.id,
        sample_meta_data_id: sampleId,
        similarity_id: similarity,
      });
    }

    const response = await fetch("/api/answers_sim", {
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
            onNext={onNext}
            onPrev={onPrev}
            sampleMetaDataList={sampleMetaDataList.slice(
              numSamplePerPage * (pageNumber - 1),
              numSamplePerPage * pageNumber,
            )}
            similarityItemList={similarityItemList}
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
