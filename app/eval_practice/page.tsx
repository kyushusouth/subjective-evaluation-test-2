import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    redirect("/login");
  }

  return (
    <div className="my-10 flex flex-col gap-10">
      <section className="space-y-2 text-base">
        <h1 className="text-xl text-center mb-8">練習試行について</h1>
        <p className="leading-relaxed">
          練習試行は、本番試行の前に行っていただく練習のための実験となります。
          <br />
          こちらは何度行っていただいても構いませんので、実験内容の把握にご利用ください。
        </p>
      </section>

      <hr className="border-t border-gray-300" />

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

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">明瞭性とは？</h2>
        <p className="leading-relaxed">
          一つ目の評価項目である明瞭性は、
          <span className="font-bold">
            発話内容自体がどれくらい聞き取りやすかったか
          </span>
          を指します。
          <br />
          この評価は自然性とは異なり、発話内容の理解のしやすさに焦点を当てています。
        </p>
        <p>各音声ごとに、下記の五段階で評価してください。</p>
        <ol>
          <li>1: 非常に悪い</li>
          <li>2: 悪い</li>
          <li>3: 普通</li>
          <li>4: 良い</li>
          <li>5: 非常に良い</li>
        </ol>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">自然性とは？</h2>
        <p className="leading-relaxed">
          二つ目の評価項目である自然性は、
          <span className="font-bold">
            発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたか
          </span>
          を指します。
          <br />
          例えば、音質自体やイントネーションの自然さなどが評価の観点として挙げられます。
          <br />
          イントネーションなど発話内容に関連する要素も含まれますが、ここではどれくらい自然な音声であるかを評価してください。
          <br />
          発話内容の聞き取りやすさではなく、音声全体の自然さが評価の対象です。この点が明瞭性の評価と異なる部分です。
        </p>
        <p>各音声ごとに、下記の五段階で評価してください。</p>
        <ol>
          <li>1: 非常に悪い</li>
          <li>2: 悪い</li>
          <li>3: 普通</li>
          <li>4: 良い</li>
          <li>5: 非常に良い</li>
        </ol>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">ダミー音声について</h2>
        <p className="leading-relaxed">
          音声サンプル内には、ダミー音声が含まれています。ダミー音声では、以下のような音声が再生されます。
          <br />
          <br />
          <span className="font-bold">
            「これはダミー音声です。自然性は〇〇を、明瞭性は〇〇を選択してください。」
          </span>
          <br />
          <br />
          再生した音声がダミー音声であった場合、必ずこの音声で指定された評価値を選択してください。これは、実験において適当な回答を防止するためのものです。
          <br />
          特に、
          <span className="font-bold">
            本番試行においてダミー音声で指定された評価値を誤って選んだ場合は、全ての回答が無効となります。また、その場合は報酬もお支払いできません（練習試行の結果は無関係です）。
          </span>
          <br />
          誠に申し訳ありませんが、ご了承いただきますようよろしくお願い致します。
        </p>
      </section>

      <button
        type="button"
        className="bg-slate-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-fit mx-auto"
      >
        <Link href="/eval_practice/exp">練習試行を開始</Link>
      </button>
    </div>
  );
}
