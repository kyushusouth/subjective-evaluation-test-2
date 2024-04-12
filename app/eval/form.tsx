/* eslint-disable jsx-a11y/media-has-caption */

"use client";

import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import {
  SampleMetaData,
  NaturalnessItem,
  IntelligibilityItem,
} from "@prisma/client";
import { SchemaType } from "@/app/eval/schema";

export default function Form({
  onNext,
  onPrev,
  sampleMetaDataList,
  domainName,
  bucketName,
  naturalnessItemList,
  intelligibilityItemList,
  pageNumber,
}: {
  onNext: () => void;
  onPrev: () => void;
  sampleMetaDataList: SampleMetaData[];
  domainName: string;
  bucketName: string;
  naturalnessItemList: NaturalnessItem[];
  intelligibilityItemList: IntelligibilityItem[];
  pageNumber: number;
}) {
  const methods = useFormContext<SchemaType>();

  const {
    register,
    formState: { isValid },
  } = methods;

  return (
    <div className="flex flex-col justify-center items-center gap-10 my-10">
      {sampleMetaDataList.map((data) => {
        const sampleId = data.id;
        const sampleUrl = `${domainName}/${bucketName}/${data.file_path}`;
        return (
          <div
            key={sampleId}
            className="flex flex-col justify-center items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow"
          >
            <audio src={sampleUrl} controls controlsList="nodownload" />
            <div className="flex flex-row justify-between items-center gap-6">
              <label htmlFor="naturalness" className="w-full">
                自然性
                <select
                  id="naturalness"
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
                  defaultValue=""
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register(`naturalness_${sampleId}`, { required: true })}
                >
                  <option value="" disabled hidden>
                    -----
                  </option>
                  {naturalnessItemList.map((naturalnessItem) => (
                    <option key={naturalnessItem.id} value={naturalnessItem.id}>
                      {naturalnessItem.item}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="intelligibility" className="w-full">
                明瞭性
                <select
                  id="intelligibility"
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
                  defaultValue=""
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...register(`intelligibility_${sampleId}`, {
                    required: true,
                  })}
                >
                  <option value="" disabled hidden>
                    -----
                  </option>
                  {intelligibilityItemList.map((intelligibilityItem) => (
                    <option
                      key={intelligibilityItem.id}
                      value={intelligibilityItem.id}
                    >
                      {intelligibilityItem.item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        );
      })}

      <div className="flex flex-row justify-center items-center gap-10 mt-2">
        <button
          type="button"
          className={clsx("bg-slate-500 text-white py-2 px-4 rounded", {
            "hover:bg-blue-700": pageNumber !== 1,
            "cursor-not-allowed bg-slate-500/50": pageNumber === 1,
          })}
          disabled={pageNumber === 1}
          onClick={onPrev}
        >
          戻る
        </button>
        <button
          type="button"
          className={clsx("bg-slate-500 text-white py-2 px-4 rounded", {
            "hover:bg-blue-700": isValid,
            "cursor-not-allowed bg-slate-500/50": !isValid,
          })}
          disabled={!isValid}
          onClick={onNext}
        >
          進む
        </button>
      </div>
    </div>
  );
}
