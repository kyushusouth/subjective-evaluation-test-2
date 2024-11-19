import { redirect } from "next/navigation";
import ContentsWrapper from "@/app/components/sim/contentsWrapper";
import { fetchRespondent } from "@/app/lib/data";

export default async function Page() {
  const respondent = await fetchRespondent();
  if (!respondent.is_finished_sim_practice || respondent.is_finished_sim_main) {
    redirect("/");
  }
  return <ContentsWrapper expType="main" />;
}
