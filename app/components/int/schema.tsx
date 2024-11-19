/* eslint-disable no-restricted-syntax */
import { SampleMetaData } from "@prisma/client";
import * as Yup from "yup";

const createSchema = (sampleMetaDataList: SampleMetaData[]) => {
  const obj: Record<string, Yup.StringSchema> = {};
  for (const sampleMetaData of sampleMetaDataList) {
    obj[`intelligibility_${sampleMetaData.id}`] = Yup.string().required();
  }
  return Yup.object().shape(obj);
};

export default createSchema;
