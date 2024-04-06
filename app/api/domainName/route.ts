/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/prefer-default-export */
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

export function GET(request: Request) {
  const domainName = process.env.GCS_DOMAIN_NAME;
  return Response.json(domainName);
}
