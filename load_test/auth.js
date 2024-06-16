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

function login(email, password) {
  const payload = JSON.stringify({ email, password });

  const params = {
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
    },
  };

  const attempts = 0;
  const waitTime = 2;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const res = http.post(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      payload,
      params,
    );

    if (res.status === 200) {
      check(res, { "login successful": (r) => r.status === 200 });
      return res.json("access_token");
    } else if (res.status === 429) {
      console.warn(`Rate limit exceeded. Retrying in ${waitTime} seconds...`);
      sleep(waitTime);
      attempts++;
      waitTime *= 2;
    } else {
      console.error(`Login failed: ${res.status}`);
      errorRate.add(1);
      break;
    }
  }

  return null;
}

function logout(authToken) {
  const params = {
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${authToken}`,
    },
  };

  const res = http.post(`${supabaseUrl}/auth/v1/logout`, null, params);

  check(res, { "logout successful": (r) => r.status === 200 });
}

export default function () {
  const user = users[__VU % users.length];
  const authToken = login(user.email, user.password);

  if (authToken) {
    console.log(`User ${user.email} logged in with token: ${authToken}`);
    logout(authToken);
  } else {
    console.error(`User ${user.email} failed to log in.`);
    errorRate.add(1);
  }

  sleep(1);
}
