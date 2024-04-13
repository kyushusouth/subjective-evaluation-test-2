"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import {
  SampleMetaData,
  NaturalnessItem,
  IntelligibilityItem,
  Respondents,
} from "@prisma/client";
import Form from "@/app/eval/form";
import Confirm from "@/app/eval/confirm";
import { SchemaType } from "@/app/eval/schema";

export default function Content({
  sampleMetaDataList,
  domainName,
  bucketName,
  naturalnessItemList,
  intelligibilityItemList,
  respondent,
  numSamplePerPage,
}: {
  sampleMetaDataList: SampleMetaData[];
  domainName: string;
  bucketName: string;
  naturalnessItemList: NaturalnessItem[];
  intelligibilityItemList: IntelligibilityItem[];
  respondent: Respondents | undefined;
  numSamplePerPage: number;
}) {
  const methods = useForm<SchemaType>({
    mode: "onSubmit",
  });
  const { handleSubmit } = methods;
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const lastPageNumber = Math.ceil(
    sampleMetaDataList.length / numSamplePerPage,
  );
  const pathName = usePathname().replace(/\//g, "");

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
    // eslint-disable-next-line no-restricted-syntax
    for (const sampleMetaData of sampleMetaDataList) {
      const sampleId = Number(sampleMetaData.id);
      const naturalness = Number(data[`naturalness_${sampleId}`]);
      const intelligibility = Number(data[`intelligibility_${sampleId}`]);
      dataList.push({
        page_name: pathName,
        respondent_id: respondent?.id,
        sample_meta_data_id: sampleId,
        naturalness_id: naturalness,
        intelligibility_id: intelligibility,
      });
    }
    const response = await fetch("api/answers", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataList),
      method: "POST",
    });
    const result = await response.json();
    if (result.success) {
      router.push("/thanks");
    } else {
      router.push("/eval");
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {pageNumber === lastPageNumber + 1 ? (
          <Confirm onPrev={onPrev} />
        ) : (
          <Form
            onNext={onNext}
            onPrev={onPrev}
            sampleMetaDataList={sampleMetaDataList.slice(
              numSamplePerPage * (pageNumber - 1),
              numSamplePerPage * pageNumber,
            )}
            domainName={domainName}
            bucketName={bucketName}
            naturalnessItemList={naturalnessItemList}
            intelligibilityItemList={intelligibilityItemList}
            pageNumber={pageNumber}
            lastPageNumber={lastPageNumber}
          />
        )}
      </form>
    </FormProvider>
  );
}
