import { IntelligibilityItem } from "@prisma/client";

export function IntelligibilityExplanation() {
  return (
    <p className="leading-relaxed">
      明瞭性は、
      <span className="font-bold">
        話者の意図した発話内容を、一回の発話でどの程度聞き取ることができたか
      </span>
      を評価するものとします。
    </p>
  );
}

/* eslint-disable jsx-a11y/media-has-caption */
export function ExperimentOverviewSection({
  intelligibilityItemList,
}: {
  intelligibilityItemList: IntelligibilityItem[];
}) {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg text-center">実験内容</h2>
      <p className="leading-relaxed">
        実験で行っていただくのは、音声の明瞭性の評価になります。
      </p>

      <IntelligibilityExplanation />

      <p className="leading-relaxed">
        各音声サンプルに対する評価の流れは、以下の三段階で構成されます。
      </p>
      <ol className="leading-relaxed list-decimal list-inside">
        <li>提示された音声サンプルを一回再生し、発話内容を聞き取る。</li>
        <li>「発話内容を表示」ボタンを押し、本来の発話内容を表示する。</li>
        <li>
          想定していた発話内容と本来の発話内容を照らし合わせ、音声の聞き取りやすさを五段階評価する。
        </li>
      </ol>

      <p>五段階評価の項目は以下のとおりです。</p>
      <ol>
        {intelligibilityItemList.map((item) => (
          <li key={item.id}>
            {item.id}: {item.item}
          </li>
        ))}
      </ol>

      <p className="leading-relaxed">
        評価にあたり、音声は一度しか聞くことができません。
        <span className="font-bold">
          音声サンプルの再生を途中で停止したり、巻き戻したりすることは実装上可能ですが、実験の意図に反しますのでご遠慮ください。
        </span>
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
        「これはダミー音声です。明瞭性は〇〇を選択してください。」
      </span>
      <br />
      <br />
      再生した音声がダミー音声であった場合、必ずこの音声で指定された評価値を選択してください。これは、実験において適当な回答を防止するためのものです。
      <br />
      <br />
      例として、下記の音声では、
      <span className="font-bold">
        {`これはダミー音声です。明瞭性は「${dummySampleAnswer.id}: ${dummySampleAnswer.item}」を選択してください。`}
      </span>
      と指定しています。
      <audio
        src={dummySampleUrl}
        controls
        controlsList="nodownload"
        className="w-full max-w-72 my-4 mx-auto"
      />
      {`この場合、明瞭性は「${dummySampleAnswer.id}: ${dummySampleAnswer.item}」を選択します。音声自体の明瞭性を評価するわけではないため、ご注意ください。`}
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
