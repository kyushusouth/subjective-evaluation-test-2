/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/media-has-caption */

"use client";

import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { useState } from "react";
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

  const [isVisibleAccordion1, setIsVisibleAccordion1] = useState(false);
  const [isVisibleAccordion2, setIsVisibleAccordion2] = useState(false);
  const [isVisibleAccordion3, setIsVisibleAccordion3] = useState(false);

  return (
    <div className="my-10 flex flex-col justify-center items-center gap-10">
      <div id="accordion-open" data-accordion="open" className="w-full">
        <h2 id="accordion-open-heading-1">
          <button
            type="button"
            className={clsx(
              "flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0 rounded-t-xl hover:bg-gray-100 gap-3",
              {
                "text-gray-800": isVisibleAccordion1,
                "text-gray-500": !isVisibleAccordion1,
              },
            )}
            data-accordion-target="#accordion-open-body-1"
            aria-expanded={isVisibleAccordion1}
            aria-controls="accordion-open-body-1"
            onClick={() => setIsVisibleAccordion1(!isVisibleAccordion1)}
          >
            <span className="flex items-center">
              <svg
                className="w-5 h-5 me-2 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              明瞭性とは？
            </span>
            <svg
              data-accordion-icon
              className={clsx("w-3 h-3 shrink-0", {
                "rotate-180": !isVisibleAccordion1,
              })}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        <div
          id="accordion-open-body-1"
          className={clsx("", {
            hidden: !isVisibleAccordion1,
            visible: isVisibleAccordion1,
          })}
          aria-labelledby="accordion-open-heading-1"
        >
          <div className="p-5 space-y-4 text-base border border-b-0 border-gray-200 text-gray-500">
            <p className="leading-relaxed">
              一つ目の評価項目である明瞭性は、
              <span className="font-bold">
                発話内容自体がどれくらい聞き取りやすかったか
              </span>
              を指します。
              <br />
              この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています。
            </p>
          </div>
        </div>

        <h2 id="accordion-open-heading-2">
          <button
            type="button"
            className={clsx(
              "flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0 hover:bg-gray-100 gap-3",
              {
                "text-gray-800": isVisibleAccordion2,
                "text-gray-500": !isVisibleAccordion2,
              },
            )}
            data-accordion-target="#accordion-open-body-2"
            aria-expanded={isVisibleAccordion2}
            aria-controls="accordion-open-body-2"
            onClick={() => setIsVisibleAccordion2(!isVisibleAccordion2)}
          >
            <span className="flex items-center">
              <svg
                className="w-5 h-5 me-2 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              自然性とは？
            </span>
            <svg
              data-accordion-icon
              className={clsx("w-3 h-3 shrink-0", {
                "rotate-180": !isVisibleAccordion2,
              })}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        <div
          id="accordion-open-body-2"
          className={clsx("", {
            hidden: !isVisibleAccordion2,
            visible: isVisibleAccordion2,
          })}
          aria-labelledby="accordion-open-heading-2"
        >
          <div className="p-5 space-y-4 text-base border border-b-0 border-gray-200 text-gray-500">
            <p className="leading-relaxed">
              二つ目の評価項目である自然性は、
              <span className="font-bold">
                発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたか
              </span>
              を指します。
              <br />
              例えば、音質自体やイントネーションの自然さなどが評価の観点として挙げられます。
              <br />
              イントネーションなど発話内容に関連する要素も含まれますが、ここではどれくらい自然な音声であるかを評価してください。
              <br />
              発話内容の聞き取りやすさではなく、音声全体の自然さが評価の対象です。この点が明瞭性の評価と異なる部分です。
            </p>
          </div>
        </div>

        <h2 id="accordion-open-heading-3">
          <button
            type="button"
            className={clsx(
              "flex items-center justify-between w-full p-5 font-medium rtl:text-right border hover:bg-gray-100 gap-3",
              {
                "text-gray-800": isVisibleAccordion3,
                "text-gray-500": !isVisibleAccordion3,
              },
            )}
            data-accordion-target="#accordion-open-body-3"
            aria-expanded={isVisibleAccordion3}
            aria-controls="accordion-open-body-3"
            onClick={() => setIsVisibleAccordion3(!isVisibleAccordion3)}
          >
            <span className="flex items-center">
              <svg
                className="w-5 h-5 me-2 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>{" "}
              ダミー音声について
            </span>
            <svg
              data-accordion-icon
              className={clsx("w-3 h-3 shrink-0", {
                "rotate-180": !isVisibleAccordion3,
              })}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5 5 1 1 5"
              />
            </svg>
          </button>
        </h2>
        <div
          id="accordion-open-body-3"
          className={clsx("", {
            hidden: !isVisibleAccordion3,
            visible: isVisibleAccordion3,
          })}
          aria-labelledby="accordion-open-heading-3"
        >
          <div className="p-5 space-y-4 text-base border border-t-0 border-gray-200 text-gray-500">
            <p className="leading-relaxed">
              音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。
              <br />
              <br />
              <span className="font-bold">
                「これはダミー音声です。自然性は〇〇を、明瞭性は〇〇を選択してください。」
              </span>
              <br />
              <br />
              再生した音声がダミー音声であった場合、必ずこの音声で指定された評価値を選択してください。これは、実験において適当な回答を防止するためのものです。
              <br />
              特に、
              <span className="font-bold">
                本番試行においてダミー音声で指定された評価値を誤って選んだ場合は、全ての回答が無効となります。また、その場合は報酬もお支払いできません（練習試行の結果は無関係です）。
              </span>
              <br />
              誠に申し訳ありませんが、ご了承いただきますようよろしくお願い致します。
            </p>
          </div>
        </div>
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
      </div>

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
