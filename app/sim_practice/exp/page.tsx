import { redirect } from "next/navigation";
import ContentsWrapper from "@/app/components/sim/contentsWrapper";
import { fetchRespondent } from "@/app/lib/data";

export default async function Page() {
  const respondent = await fetchRespondent();
  if (!respondent.is_finished_int_main) {
    redirect("/");
    return null;
  }
  console.log("sim_practice/exp.ts");
  return <ContentsWrapper expType="practice" />;
}
