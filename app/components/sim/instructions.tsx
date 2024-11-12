import { SimilarityItem } from "@prisma/client";

export function SimilarityExplanation() {
  return (
    <p className="leading-relaxed">
      類似性は、
      <span className="font-bold">
        評価対象の音声が同一話者の原音声とどれくらい似ているか
      </span>
      を評価するものとします。
      <br />
      発話内容は評価に影響しないため、提示される音声ペアには発話内容が同じ場合も、異なる場合もランダムに含まれますが、発話内容に惑わされないようご注意ください。
    </p>
  );
}

/* eslint-disable jsx-a11y/media-has-caption */
export function ExperimentOverviewSection({
  similarityItemList,
}: {
  similarityItemList: SimilarityItem[];
}) {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg text-center">実験内容</h2>
      <p className="leading-relaxed">
        実験で行っていただくのは、音声の類似性の評価になります。
      </p>

      <SimilarityExplanation />

      <p className="leading-relaxed">
        各音声サンプルに対する評価の流れは、以下の二段階で構成されます。
      </p>
      <ol className="leading-relaxed list-decimal list-inside">
        <li>評価対象の音声と原音声を聞き比べる。</li>
        <li>評価対象の音声が原音声にどれくらい似ていたかを五段階評価する。</li>
      </ol>

      <p>五段階評価の項目は以下のとおりです。</p>
      <ol>
        {similarityItemList.map((item) => (
          <li key={item.id}>
            {item.id}: {item.item}
          </li>
        ))}
      </ol>

      <p className="leading-relaxed">
        評価にあたり、音声は何度聞いていただいても構いません。
      </p>
    </section>
  );
}

export function DummySampleExplanation({
  dummySampleUrl,
  dummySampleAnswer,
}: {
  dummySampleUrl: string;
  dummySampleAnswer: { id: number; item: string };
}) {
  return (
    <p className="leading-relaxed">
      音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。
      <br />
      <br />
      <span className="font-bold">
        「これはダミー音声です。類似性は〇〇を選択してください。」
      </span>
      <br />
      <br />
      再生した音声がダミー音声であった場合、必ずこの音声で指定された評価値を選択してください。これは、実験において適当な回答を防止するためのものです。
      <br />
      <br />
      例として、下記の音声では、
      <span className="font-bold">
        {`これはダミー音声です。類似性は「${dummySampleAnswer.id}: ${dummySampleAnswer.item}」を選択してください。`}
      </span>
      と指定しています。
      <audio
        src={dummySampleUrl}
        controls
        controlsList="nodownload"
        className="w-full max-w-72 my-4 mx-auto"
      />
      {`この場合、類似性は「${dummySampleAnswer.id}: ${dummySampleAnswer.item}」を選択します。音声自体の類似性を評価するわけではないため、ご注意ください。`}
      また、実際の評価時には音声がペアで提示されますが、ダミー音声である場合は必ず両方とも全く同じダミー音声が流れますので、混乱なされないようご注意ください。
      <br />
      <br />
      特に、
      <span className="font-bold">
        本番試行においてダミー音声で指定された評価値を誤って選んだ場合は、全ての回答を無効とさせていただきます（練習試行の結果は無関係です）。
      </span>
      <br />
      誠に申し訳ありませんが、ご了承いただきますようよろしくお願い致します。
    </p>
  );
}

export function DummySampleExplanationSection({
  dummySampleUrl,
  dummySampleAnswer,
}: {
  dummySampleUrl: string;
  dummySampleAnswer: { id: number; item: string };
}) {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg text-center">ダミー音声について</h2>
      <DummySampleExplanation
        dummySampleUrl={dummySampleUrl}
        dummySampleAnswer={dummySampleAnswer}
      />
    </section>
  );
}
