/* eslint-disable import/prefer-default-export */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl === undefined) {
  throw new Error("supabaseUrl is undefined");
} else if (supabaseKey === undefined) {
  throw new Error("supabaseKey is undefined");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
