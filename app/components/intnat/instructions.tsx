/* eslint-disable jsx-a11y/media-has-caption */
export function ExperimentOverviewSection() {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg">実験内容</h2>
      <p className="leading-relaxed">
        実験で行っていただくのは、下記二つです。
      </p>
      <ol className="leading-relaxed list-decimal list-inside">
        <li>音声を聞く。</li>
        <li>音声の明瞭性・自然性を五段階で評価する。</li>
      </ol>
      <p className="leading-relaxed">
        評価にあたり、音声は何度聞いていただいても構いません。
        <br />
        評価項目である明瞭性・自然性について、どのような観点で評価するかを以下に記載しておりますので、ご確認ください。
      </p>
    </section>
  );
}

export function IntelligibilityExplanation() {
  return (
    <p className="leading-relaxed">
      一つ目の評価項目である明瞭性は、
      <span className="font-bold">発話内容どれくらい聞き取りやすかったか</span>
      を指します。
      <br />
      明瞭性の判断基準としては、聞き取ろうとするのに要した努力の程度や、最終的な発話内容の理解の程度などが挙げられます。
    </p>
  );
}

export function IntelligibilityExplanationSection() {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg">明瞭性とは？</h2>
      <IntelligibilityExplanation />
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

export function NaturalnessExplanation() {
  return (
    <p className="leading-relaxed">
      二つ目の評価項目である自然性は、
      <span className="font-bold">
        発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたか
      </span>
      を指します。
      <br />
      自然性の判断基準としては、声質やイントネーションの自然さなどが挙げられます。
    </p>
  );
}

export function NaturalnessExplanationSection() {
  return (
    <section className="space-y-4 text-base">
      <h2 className="text-lg">自然性とは？</h2>
      <NaturalnessExplanation />
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
        「これはダミー音声です。明瞭性は〇〇を、自然性は〇〇を選択してください。」
      </span>
      <br />
      <br />
      再生した音声がダミー音声であった場合、必ずこの音声で指定された評価値を選択してください。これは、実験において適当な回答を防止するためのものです。
      <br />
      <br />
      例として、下記の音声では、
      <span className="font-bold">
        「これはダミー音声です。明瞭性は「2: 悪い」を、自然性は「1:
        非常に悪い」を選択してください。」
      </span>
      と指定しています。
      <audio
        src={dummySampleUrl}
        controls
        controlsList="nodownload"
        className="my-4 mx-auto"
      />
      この場合、明瞭性は「2:
      悪い」、自然性は「1:非常に悪い」を選択します。音声自体の明瞭性や自然性を評価するわけではないため、ご注意ください。
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
