/* eslint-disable react/jsx-props-no-spreading */

"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SexItem, Respondents } from "@prisma/client";
import clsx from "clsx";

type Inputs = {
  age: number;
  sex: string;
};

export default function Page({
  sexItemList,
  respondent,
}: {
  sexItemList: SexItem[];
  respondent: Respondents;
}) {
  const {
    register,
    handleSubmit,
    formState: { isValid, isSubmitting, isSubmitted, errors },
  } = useForm<Inputs>();
  const router = useRouter();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const response = await fetch("api/respondent", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      method: "POST",
    });
    const result = await response.json();
    if (result.success) {
      router.push("/thanks");
    } else {
      throw new Error("Failed to Submit.");
    }
  };

  return (
    <div className="my-10">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col justify-center items-center gap-10">
          <label htmlFor="age" className="w-full">
            年齢
            <input
              id="age"
              type="number"
              className="w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
              defaultValue={
                respondent?.age === -1 ? undefined : respondent?.age
              }
              {...register("age", { required: true, valueAsNumber: true })}
            />
          </label>
          {errors.age && <p>年齢を入力してください。</p>}
          <label htmlFor="sex" className="w-full">
            性別
            <select
              id="sex"
              className="w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
              defaultValue={respondent?.sex}
              {...register("sex", { required: true })}
            >
              {sexItemList.map((sexItem) => (
                <option key={sexItem.id} value={sexItem.item}>
                  {sexItem.item}
                </option>
              ))}
            </select>
          </label>

          {isSubmitting || isSubmitted ? (
            <button
              disabled
              type="button"
              className="bg-blue-700 text-white py-2 px-4 rounded"
            >
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 me-3 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              処理中...
            </button>
          ) : (
            <button
              type="submit"
              className={clsx("bg-slate-500 text-white py-2 px-4 rounded", {
                "hover:bg-blue-700": isValid,
                "cursor-not-allowed bg-slate-500/50": !isValid,
              })}
              disabled={!isValid}
            >
              提出する
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
