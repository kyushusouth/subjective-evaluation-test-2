/* eslint-disable react/jsx-props-no-spreading */
import { useFormContext } from "react-hook-form";
import createSchema from "@/app/components/int/schema";
import * as Yup from "yup";
import clsx from "clsx";
import { IntelligibilityItem } from "@prisma/client";

export default function RadioButton({
  label,
  answerItem,
  sampleId,
  itemList,
  disabled,
}: {
  label: string;
  answerItem: string;
  sampleId: number;
  itemList: IntelligibilityItem[];
  disabled: boolean;
}) {
  const Schema = createSchema(1);
  type SchemaType = Yup.InferType<typeof Schema>;

  const { register } = useFormContext<SchemaType>();

  return (
    <div className="w-full">
      <label htmlFor={`${answerItem}_${sampleId}`} className="w-full block">
        {label}
      </label>
      <div className="flex flex-col">
        {itemList.map((item) => (
          <label
            key={item.id}
            htmlFor={`${answerItem}_${sampleId}_${item.id}`}
            className="flex items-center"
          >
            <input
              id={`${answerItem}_${sampleId}_${item.id}`}
              type="radio"
              value={item.id}
              {...register(`${answerItem}_${sampleId}`, {
                required: true,
              })}
              className={clsx("mr-2", {
                "bg-gray-200": disabled,
              })}
              disabled={disabled}
            />
            {item.id}: {item.item}
          </label>
        ))}
      </div>
    </div>
  );
}
