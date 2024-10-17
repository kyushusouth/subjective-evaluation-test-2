/* eslint-disable jsx-a11y/media-has-caption */
export function ExperimentOverviewSection() {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg">実験内容</h2>
      <p className="leading-relaxed">
        実験で行っていただくのは、下記二つです。
      </p>
      <ol className="leading-relaxed list-decimal list-inside">
        <li>二つの音声がペアで提示されるため、それらを聴き比べる。</li>
        <li>
          二つの音声の声質がどれくらい似ているか（類似性）を五段階で評価する。
        </li>
      </ol>
      <p className="leading-relaxed">
        評価にあたり、音声は何度聞いていただいても構いません。
        <br />
        評価項目である類似性について、どのような観点で評価するかを以下に記載しておりますので、ご確認ください。
      </p>
    </section>
  );
}

export function SimilarityExplanation() {
  return (
    <p className="leading-relaxed">
      類似性は、
      <span className="font-bold">
        発話内容によらず、二つの音声の声質がどれくらい似ているか
      </span>
      を指します。
      <br />
      発話内容は評価に影響しないため、提示される音声ペアには発話内容が同じ場合も、異なる場合もランダムに含まれます。評価に影響はありませんので、発話内容に惑わされないようご注意ください。
    </p>
  );
}

export function SimilarityExplanationSection() {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg">類似性とは？</h2>
      <SimilarityExplanation />
      <p>各音声ごとに、下記の五段階で評価してください。</p>
      <ol>
        <li>1: 非常に悪い</li>
        <li>2: 悪い</li>
        <li>3: 普通</li>
        <li>4: 良い</li>
        <li>5: 非常に良い</li>
      </ol>
    </section>
  );
}

export function DummySampleExplanation({
  dummySampleUrl,
}: {
  dummySampleUrl: string;
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
        「これはダミー音声です。類似性は、「3: 普通」を選択してください。」
      </span>
      と指定しています。
      <audio
        src={dummySampleUrl}
        controls
        controlsList="nodownload"
        className="my-4 mx-auto"
      />
      この場合、類似性は「3:普通」を選択します。音声自体の類似性を評価するわけではないため、ご注意ください。
      また、実際の類似性評価時には音声がペアで提示されますが、ダミー音声である場合は必ず両方とも全く同じダミー音声が流れます。混乱なされないようご注意ください。
      <br />
      <br />
      特に、
      <span className="font-bold">
        本番試行においてダミー音声で指定された評価値を誤って選んだ場合は、全ての回答が無効となります。また、その場合は報酬もお支払いできません（練習試行の結果は無関係です）。
      </span>
      <br />
      誠に申し訳ありませんが、ご了承いただきますようよろしくお願い致します。
    </p>
  );
}

export function DummySampleExplanationSection({
  dummySampleUrl,
}: {
  dummySampleUrl: string;
}) {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg">ダミー音声について</h2>
      <DummySampleExplanation dummySampleUrl={dummySampleUrl} />
    </section>
  );
}
