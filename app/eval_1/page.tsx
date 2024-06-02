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
    <div className="flex flex-col gap-10">
      <section className="space-y-2 text-base">
        <h1 className="text-xl text-center mb-8">本番試行について</h1>
        <p className="leading-relaxed">
          本番試行は、練習試行の後に行っていただく本番の実験になります。
          <br />
          <span className="font-bold">
            一度提出しますと、回答の修正は不可能となりますのでご注意ください。
          </span>
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
          <li>音声の自然性・明瞭性を五段階で評価する。</li>
        </ol>
        <p className="leading-relaxed">
          評価にあたり、音声は何度聞いていただいても構いません。
          <br />
          評価項目である自然性・明瞭性については、どのような観点で評価するかを以下に記載しております。
          <br />
          ご確認ください。
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">自然性とは？</h2>
        <p className="leading-relaxed">
          一つ目の評価項目である自然性は、
          <br />
          <span className="font-bold">
            発話内容によらず、その音声がどれくらい人間らしく自然なものに聞こえたか
          </span>
          を指します。
          <br />
          例えば、音質自体やイントネーションの自然さなどが評価の観点として挙げられます。
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
        <h2 className="text-lg">明瞭性とは？</h2>
        <p className="leading-relaxed">
          二つ目の評価項目である明瞭性は、
          <br />
          <span className="font-bold">
            発話内容自体がどれくらい聞き取りやすかったか
          </span>
          を指します。
          <br />
          聞き取りやすさのみを評価の観点とする点が、自然性と異なります。
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

      <button
        type="button"
        className="bg-slate-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-fit mx-auto"
      >
        <Link href="/eval_1/exp">本番試行を開始</Link>
      </button>
    </div>
  );
}
