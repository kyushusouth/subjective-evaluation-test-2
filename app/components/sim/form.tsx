/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/media-has-caption */

"use client";

import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { SampleMetaData, SimilarityItem } from "@prisma/client";
import createSchema from "@/app/components/sim/schema";
import {
  SimilarityExplanation,
  DummySampleExplanation,
} from "@/app/components/sim/instructions";
import * as Yup from "yup";

export default function Form({
  onNext,
  onPrev,
  sampleMetaDataList,
  similarityItemList,
  pageNumber,
  lastPageNumber,
  dummySampleUrl,
  domainName,
  bucketName,
}: {
  onNext: () => void;
  onPrev: () => void;
  sampleMetaDataList: SampleMetaData[][];
  similarityItemList: SimilarityItem[];
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

  const [isVisibleAccordion1, setIsVisibleAccordion1] = useState(false);
  const [isVisibleAccordion2, setIsVisibleAccordion2] = useState(false);
  const [randValobj, setRandValObj] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (!(pageNumber in randValobj)) {
      const newRandVal = Math.random() < 0.5 ? 0 : 1;
      setRandValObj((prevRandValobj) => ({
        ...prevRandValobj,
        [pageNumber]: newRandVal,
      }));
    }
  }, [pageNumber]);

  const currentRandVal = randValobj[pageNumber];

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
              類似性とは？
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
            <SimilarityExplanation />
          </div>
        </div>

        <h2 id="accordion-open-heading-2">
          <button
            type="button"
            className={clsx(
              "flex items-center justify-between w-full p-5 font-medium rtl:text-right border hover:bg-gray-100 gap-3",
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
              </svg>{" "}
              ダミー音声について
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
          <div className="p-5 space-y-4 text-base border border-t-0 border-gray-200 text-gray-500">
            <DummySampleExplanation dummySampleUrl={dummySampleUrl} />
          </div>
        </div>
      </div>

      <div>
        <ul className="flex flex-col justify-center items-center gap-10">
          {sampleMetaDataList.map((data) => {
            const sampleSynthId = data[0].id;
            const sampleSynthUrl = `${domainName}/${bucketName}/${data[0].file_path}`;
            const sampleGTUrl = `${domainName}/${bucketName}/${data[1].file_path}`;

            return (
              <li
                data-test-id="formItem"
                key={sampleSynthId}
                className="flex flex-col justify-center items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow"
              >
                <audio
                  src={currentRandVal === 0 ? sampleSynthUrl : sampleGTUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full min-w-64"
                />
                <audio
                  src={currentRandVal === 0 ? sampleGTUrl : sampleSynthUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full min-w-64"
                />

                <div className="flex flex-row justify-between items-center gap-x-16 min-w-64">
                  <div className="w-full">
                    <label
                      htmlFor={`similarity_${sampleSynthId}`}
                      className="w-full block"
                    >
                      類似性
                    </label>
                    <div className="flex flex-col">
                      {similarityItemList.map((similarityItem) => (
                        <label
                          key={similarityItem.id}
                          className="flex items-center"
                        >
                          <input
                            type="radio"
                            value={similarityItem.id}
                            {...register(`similarity_${sampleSynthId}`, {
                              required: true,
                            })}
                            className="mr-2"
                          />
                          {similarityItem.id}: {similarityItem.item}
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
