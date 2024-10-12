/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-restricted-syntax */
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchDummySampleUrlSim, fetchRespondent } from "@/app/lib/data";
import {
  ExperimentOverviewSection,
  SimilarityExplanationSection,
  DummySampleExplanationSection,
} from "@/app/components/sim/instructions";

export default async function Page() {
  const respondent = await fetchRespondent();
  if (
    !respondent?.is_finished_intnat_main ||
    !respondent.is_finished_sim_practice
  ) {
    redirect("/");
    return null;
  }

  const dummySampleUrl = await fetchDummySampleUrlSim();

  return (
    <div className="my-10 flex flex-col gap-10">
      <section className="space-y-2 text-base">
        <h1 className="text-xl text-center mb-8">本番試行（類似性）について</h1>
        <p className="leading-relaxed">
          本番試行（類似性）は、練習試行（類似性）の後に行っていただく本番の実験になります。
          <br />
          <span className="font-bold">
            一度提出しますと、回答の修正は不可能となりますのでご注意ください。
          </span>
        </p>
      </section>
      <hr className="border-t border-gray-300" />
      <ExperimentOverviewSection />
      <hr className="border-t border-gray-300" />
      <SimilarityExplanationSection />
      <hr className="border-t border-gray-300" />
      <DummySampleExplanationSection dummySampleUrl={dummySampleUrl} />
      <button
        type="button"
        className="bg-slate-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-fit mx-auto"
      >
        <Link href="/sim_main/exp">実験を開始する</Link>
      </button>
    </div>
  );
}
