/* eslint-disable react/jsx-props-no-spreading */
import { useFormContext } from "react-hook-form";
import * as Yup from "yup";
import { SimilarityItem } from "@prisma/client";

export default function RadioButton({
  label,
  answerItem,
  sampleId,
  itemList,
  Schema,
}: {
  label: string;
  answerItem: string;
  sampleId: number;
  itemList: SimilarityItem[];
  Schema: Yup.ObjectSchema<
    {
      [x: string]: string | undefined;
    },
    Yup.AnyObject,
    {
      [x: string]: undefined;
    },
    ""
  >;
}) {
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
              className="mr-2"
            />
            {item.id}: {item.item}
          </label>
        ))}
      </div>
    </div>
  );
}
