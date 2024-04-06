import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
export const domainName = process.env.GCS_DOMAIN_NAME;
export const bucketName = process.env.GCS_BUCKET_NAME;
