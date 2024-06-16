import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import { Rate } from "k6/metrics";

export const errorRate = new Rate("errors");

const users = new SharedArray("users", () => JSON.parse(open("./auth.json")));

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "120s", target: users.length },
    { duration: "60s", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

const supabaseAnonKey = __ENV.SUPABASE_ANON_KEY;
const supabaseUrl = __ENV.SUPABASE_URL_PROD;

if (!supabaseAnonKey || !supabaseUrl) {
  throw new Error(
    "Both SUPABASE_ANON_KEY and SUPABASE_URL_PROD environment variables are required.",
  );
}

function submitRespondentInfo(respondentId) {
  const params = {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
  };

  const formPayload = JSON.stringify({
    sex: "無回答",
    age: 40,
  });

  const res = http.patch(
    `${supabaseUrl}/rest/v1/Respondents?id=eq.${respondentId}`,
    formPayload,
    params,
  );

  const success = check(res, {
    "submitRespondentInfo successfully": (r) => r.status === 204,
  });

  if (!success) {
    console.error(`Failed to submit respondent info: ${res.status}`);
    errorRate.add(1);
  }
}

function submitAnswers(respondentId) {
  const params = {
    Authorization: `Bearer ${supabaseAnonKey}`,
    apikey: supabaseAnonKey,
    "Content-Type": "application/json",
  };

  const answersData = Array.from({ length: 100 }, () => ({
    respondent_id: respondentId,
    sample_meta_data_id: "1",
    naturalness_id: "1",
    intelligibility_id: "1",
  }));

  const formPayload = JSON.stringify(answersData);

  const res = http.post(`${supabaseUrl}/rest/v1/Answers`, formPayload, params);

  const success = check(res, {
    "submitAnswers successfully": (r) => r.status === 201,
  });

  if (!success) {
    console.error(`Failed to submit answers: ${res.status}`);
    errorRate.add(1);
  }
}

export default function () {
  const user = users[__VU % users.length];

  submitRespondentInfo(user.respondent_id);
  submitAnswers(user.respondent_id);

  sleep(1);
}
