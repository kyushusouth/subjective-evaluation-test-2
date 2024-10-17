import clsx from "clsx";
import { useState } from "react";
import {
  IntelligibilityItem,
  NaturalnessItem,
  SimilarityItem,
} from "@prisma/client";

export function AccordionSection({
  sectionNumber,
  sectionTitle,
  ContentsComponent,
  isLast,
}: {
  sectionNumber: number;
  sectionTitle: string;
  ContentsComponent: JSX.Element;
  isLast: boolean;
}) {
  const [isVisibleAccordion, setIsVisibleAccordion] = useState(false);
  return (
    <>
      <h2 id={`accordion-open-heading-${sectionNumber}`}>
        <button
          type="button"
          className={clsx(
            "flex items-center justify-between w-full p-5 font-medium rtl:text-right border hover:bg-gray-100 gap-3",
            {
              "text-gray-800": isVisibleAccordion,
              "text-gray-500": !isVisibleAccordion,
              "border-b-0": !isLast,
            },
          )}
          data-accordion-target={`#accordion-open-body-${sectionNumber}`}
          aria-expanded={isVisibleAccordion}
          aria-controls={`accordion-open-body-${sectionNumber}`}
          onClick={() => setIsVisibleAccordion(!isVisibleAccordion)}
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
            {sectionTitle}
          </span>
          <svg
            data-accordion-icon
            className={clsx("w-3 h-3 shrink-0", {
              "rotate-180": !isVisibleAccordion,
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
        id={`accordion-open-body-${sectionNumber}`}
        className={clsx("", {
          hidden: !isVisibleAccordion,
          visible: isVisibleAccordion,
        })}
        aria-labelledby={`accordion-open-heading-${sectionNumber}`}
      >
        <div
          className={clsx(
            "p-5 space-y-4 text-base border border-gray-200 text-gray-500",
            {
              "border-t-0": isLast,
              "border-b-0": !isLast,
            },
          )}
        >
          {ContentsComponent}
        </div>
      </div>
    </>
  );
}

export function RadioButton({
  label,
  answerItem,
  sampleId,
  itemList,
  register,
}: {
  label: string;
  answerItem: string;
  sampleId: number;
  itemList: IntelligibilityItem[] | NaturalnessItem[] | SimilarityItem[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  register: Function;
}) {
  return (
    <div className="w-full">
      <label htmlFor={`${answerItem}_${sampleId}`} className="w-full block">
        {label}
      </label>
      <div className="flex flex-col">
        {itemList.map((item) => (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <label key={item.id} className="flex items-center">
            <input
              type="radio"
              value={item.id}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register(`${answerItem}_${sampleId}`, {
                required: true,
              })}
              className="mr-2"
            />
            {item.id}: {item.item}
          </label>
        ))}
      </div>
    </div>
  );
}

export function NextPrevButtons({
  onNext,
  onPrev,
  pageNumber,
  isValid,
}: {
  onNext: () => void;
  onPrev: () => void;
  pageNumber: number;
  isValid: boolean;
}) {
  return (
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
  );
}

export function ProgressPar({
  pageNumber,
  lastPageNumber,
}: {
  pageNumber: number;
  lastPageNumber: number;
}) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${(pageNumber / lastPageNumber) * 100}%` }}
      >
        {/* progress bar */}
      </div>
    </div>
  );
}
