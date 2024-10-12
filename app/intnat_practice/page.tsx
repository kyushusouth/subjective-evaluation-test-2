/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-restricted-syntax */
import Link from "next/link";
import { fetchDummySampleUrlIntNat } from "@/app/lib/data";
import {
  ExperimentOverviewSection,
  IntelligibilityExplanationSection,
  NaturalnessExplanationSection,
  DummySampleExplanationSection,
} from "@/app/components/intnat/instructions";

export default async function Page() {
  const dummySampleUrl = await fetchDummySampleUrlIntNat();

  return (
    <div className="my-10 flex flex-col gap-10">
      <section className="space-y-2 text-base">
        <h1 className="text-xl text-center mb-8">
          練習試行（明瞭性・自然性）について
        </h1>
        <p className="leading-relaxed">
          練習試行（明瞭性・自然性）は、本番試行（明瞭性・自然性）の前に行っていただく練習のための実験となります。
          <br />
          こちらは何度行っていただいても構いませんので、実験内容の把握にご利用ください。
        </p>
      </section>
      <hr className="border-t border-gray-300" />
      <ExperimentOverviewSection />
      <hr className="border-t border-gray-300" />
      <IntelligibilityExplanationSection />
      <hr className="border-t border-gray-300" />
      <NaturalnessExplanationSection />
      <hr className="border-t border-gray-300" />
      <DummySampleExplanationSection dummySampleUrl={dummySampleUrl} />
      <button
        type="button"
        className="bg-slate-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-fit mx-auto"
      >
        <Link href="/intnat_practice/exp">実験を開始する</Link>
      </button>
    </div>
  );
}
