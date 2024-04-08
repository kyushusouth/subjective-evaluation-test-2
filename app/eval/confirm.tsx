"use client";

/* eslint-disable no-restricted-syntax */
import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import { SchemaType } from "@/app/eval/schema";
import { SampleMetaData, Respondents } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function Confirm({
  onPrev,
  sampleMetaDataList,
  respondent,
}: {
  onPrev: () => void;
  sampleMetaDataList: SampleMetaData[];
  respondent: Respondents | undefined;
}) {
  const router = useRouter();
  const methods = useFormContext<SchemaType>();
  const { handleSubmit } = methods;
  const [sendData, setSendData] = useState<SchemaType | null>(null);

  function onSubmit(data: SchemaType) {
    setSendData(data);
  }

  function onError(error: SchemaType) {
    console.log("error", error);
  }

  useEffect(() => {
    handleSubmit(onSubmit, onError)();
  }, []);

  const handleClick = () => {
    const fetchDataList = async (dataList: object[]) => {
      const response = await fetch("api/answers", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataList),
        method: "POST",
      });
      const result = await response.json();
      if (result.success) {
        router.push("/");
      } else {
        router.push("/eval");
      }
    };

    if (sendData === null) {
      throw new Error("sendData is null.");
    }
    if (respondent === undefined) {
      throw new Error("respondent is undefined.");
    }

    const dataList = [];
    for (const sampleMetaData of sampleMetaDataList) {
      const sampleId = Number(sampleMetaData.id);
      const naturalness = Number(sendData[`naturalness_${sampleId}`]);
      const intelligibility = Number(sendData[`intelligibility_${sampleId}`]);
      dataList.push({
        respondent_id: respondent.id,
        sample_meta_data_id: sampleId,
        naturalness_id: naturalness,
        intelligibility_id: intelligibility,
      });
    }
    fetchDataList(dataList);
  };

  return (
    <div className="flex flex-row justify-center items-center gap-10 my-10">
      <button
        type="button"
        className="bg-slate-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        onClick={onPrev}
      >
        戻る
      </button>
      <button
        type="button"
        className="bg-slate-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        onClick={handleClick}
      >
        提出する
      </button>
    </div>
  );
}
