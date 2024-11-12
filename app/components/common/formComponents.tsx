/* eslint-disable react/jsx-props-no-spreading */

import clsx from "clsx";
import { useState } from "react";

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
