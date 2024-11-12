import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import createSchema from "@/app/components/sim/schema";
import * as Yup from "yup";
import { SampleMetaData } from "@prisma/client";

export default function NextPrevButton({
  onNext,
  onPrev,
  pageNumber,
  sampleMetaDataList,
}: {
  onNext: () => void;
  onPrev: () => void;
  pageNumber: number;
  sampleMetaDataList: SampleMetaData[][];
}) {
  const Schema = createSchema(sampleMetaDataList.length);
  type SchemaType = Yup.InferType<typeof Schema>;

  const {
    formState: { isValid },
  } = useFormContext<SchemaType>();

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
