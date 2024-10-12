import * as Yup from "yup";

const createSchema = (numSamples: number) => {
  const obj: Record<string, Yup.NumberSchema> = {};
  for (let i = 1; i <= numSamples; i += 1) {
    obj[`intelligibility_${i}`] = Yup.number().required();
    obj[`naturalness_${i}`] = Yup.number().required();
  }
  return Yup.object().shape(obj);
};

export default createSchema;
