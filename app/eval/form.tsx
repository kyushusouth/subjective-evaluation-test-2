/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
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
  lastPageNumber,
}: {
  onNext: () => void;
  onPrev: () => void;
  sampleMetaDataList: SampleMetaData[];
  domainName: string;
  bucketName: string;
  naturalnessItemList: NaturalnessItem[];
  intelligibilityItemList: IntelligibilityItem[];
  pageNumber: number;
  lastPageNumber: number;
}) {
  const methods = useFormContext<SchemaType>();

  const {
    register,
    formState: { isValid },
  } = methods;

  return (
    <div className="flex flex-col justify-center items-center gap-10 my-10">
      <section className="space-y-4 text-base">
        <p className="leading-relaxed">
          一つ目の評価項目である明瞭性は、
          <br />
          <span className="font-bold">
            発話内容自体がどれくらい聞き取りやすかったか
          </span>
          を指します。
          <br />
          この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています。
        </p>
        <p className="leading-relaxed">
          二つ目の評価項目である自然性は、
          <br />
          <span className="font-bold">
            発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたか
          </span>
          を指します。
          <br />
          例えば、音質自体やイントネーションの自然さなどが評価の観点として挙げられます。
          <br />
          イントネーションなど聞き取りやすさに関連する要素も含まれますが、ここではどれくらい自然な音声であるかを評価してください。
          <br />
          発話内容の聞き取りやすさではなく、音声全体の自然さが評価の対象です。この点が明瞭性の評価と異なる部分です。
        </p>
      </section>

      <ul className="flex flex-col justify-center items-center gap-10">
        {sampleMetaDataList.map((data) => {
          const sampleId = data.id;
          const sampleUrl = `${domainName}/${bucketName}/${data.file_path}`;
          return (
            <li
              data-testid="formItem"
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
                {/* <label htmlFor="naturalness" className="w-full">
                  自然性
                  {naturalnessItemList.map((naturalnessItem) => (
                    <div key={naturalnessItem.id}>
                      <input
                        id="naturalness"
                        type="radio"
                        {...register(`naturalness_radio_${sampleId}`, {
                          required: true,
                        })}
                      />
                      <label htmlFor="naturalness">
                        {naturalnessItem.item}
                      </label>
                    </div>
                  ))}
                  <select
                    id="naturalness"
                    data-test-id="naturalness"
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
                    defaultValue=""
                    {...register(`naturalness_${sampleId}`, { required: true })}
                  >
                    <option value="" disabled hidden>
                      -----
                    </option>
                    {naturalnessItemList.map((naturalnessItem) => (
                      <option
                        key={naturalnessItem.id}
                        value={naturalnessItem.id}
                      >
                        {naturalnessItem.id}: {naturalnessItem.item}
                      </option>
                    ))}
                  </select>
                </label> */}

                {/* <label htmlFor="intelligibility" className="w-full">
                  明瞭性
                  <select
                    id="intelligibility"
                    data-test-id="intelligibility"
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
                    defaultValue=""
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
                        {intelligibilityItem.id}: {intelligibilityItem.item}
                      </option>
                    ))}
                  </select>
                </label> */}

                <div className="w-full">
                  <label
                    htmlFor={`intelligibility_${sampleId}`}
                    className="w-full block"
                  >
                    明瞭性
                  </label>
                  <div className="flex flex-col">
                    {intelligibilityItemList.map((intelligibilityItem) => (
                      <label
                        key={intelligibilityItem.id}
                        className="flex items-center"
                      >
                        <input
                          type="radio"
                          value={intelligibilityItem.id}
                          {...register(`intelligibility_${sampleId}`, {
                            required: true,
                          })}
                          className="mr-2"
                        />
                        {intelligibilityItem.id}: {intelligibilityItem.item}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full">
                  <label
                    htmlFor={`naturalness_${sampleId}`}
                    className="w-full block relative group"
                  >
                    自然性
                  </label>
                  <div className="flex flex-col">
                    {naturalnessItemList.map((naturalnessItem) => (
                      <label
                        key={naturalnessItem.id}
                        className="flex items-center"
                      >
                        <input
                          type="radio"
                          value={naturalnessItem.id}
                          {...register(`naturalness_${sampleId}`, {
                            required: true,
                          })}
                          className="mr-2"
                        />
                        {naturalnessItem.id}: {naturalnessItem.item}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

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

      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${(pageNumber / lastPageNumber) * 100}%` }}
        >
          {/* progress bar */}
        </div>
      </div>
    </div>
  );
}
