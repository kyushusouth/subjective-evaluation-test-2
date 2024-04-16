import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {
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
        <h1 className="text-xl text-center mb-8">実験について</h1>
        <p className="leading-relaxed">
          この度はお忙しい中実験にご協力いただき、誠にありがとうございます。
          <br />
          本実験では、以下の項目を実施していただきます。
        </p>
        <ul className="list-disc list-inside leading-relaxed">
          <li>性別・年齢の回答</li>
          <li>練習試行</li>
          <li>本番試行</li>
          <li>クラウドワークスでの連絡</li>
        </ul>
        <p className="leading-relaxed">
          本実験で取得したデータは研究における学会発表や論文執筆のために利用しますが、個人を特定できるような処理は一切致しません。
          <br />
          <br />
          以下、実験項目の説明を記載しておりますので、ご確認の上進めていただきますようよろしくお願い致します。
        </p>
      </section>
      <hr className="border-t border-gray-300" />
      <section className="space-y-4 text-base">
        <h2 className="text-lg">性別・年齢の回答</h2>
        <p className="leading-relaxed">
          性別と性別を回答していただきます。
          <br />
          右上の<span className="font-bold text-blue-700">メニュー</span>
          アイコンから、
          <span className="font-bold text-blue-700">性別・年齢</span>
          をクリックすることで回答ページにアクセス頂けます。
          <br />
          一度提出しますと、回答の修正は不可能となりますのでご注意ください。
        </p>
      </section>
      <hr className="border-t border-gray-300" />
      <section className="space-y-4 text-base">
        <h2 className="text-lg">練習試行</h2>
        <p className="leading-relaxed">
          練習試行は、本番試行の前に行っていただく練習のための実験となります。
          <br />
          右上の<span className="font-bold text-blue-700">メニュー</span>
          アイコンから、
          <span className="font-bold text-blue-700">練習試行</span>
          をクリックすることで回答ページにアクセス頂けます。
          <br />
          練習試行は何度行っていただいても構いませんので、こちらを通して実験内容の把握をお願い致します。
        </p>
      </section>
      <hr className="border-t border-gray-300" />
      <section className="space-y-4 text-base">
        <h2 className="text-lg">本番試行</h2>
        <p className="leading-relaxed">
          本番試行は、練習試行の後に行っていただく本番の実験になります。
          <br />
          右上の<span className="font-bold text-blue-700">メニュー</span>
          アイコンから、
          <span className="font-bold text-blue-700">本番試行</span>
          をクリックすることで回答ページにアクセス頂けます。
          <br />
          練習試行を一度も行っていない場合、本番試行を選択できなくなっていると思いますが、そのような仕様のため問題ありません。
          <br />
          練習試行を一度完了しますと、選択可能になります。
          <br />
          一度提出しますと、回答の修正は不可能となりますのでご注意ください。
        </p>
      </section>
      <hr className="border-t border-gray-300" />
      <section className="space-y-4 text-base">
        <h2 className="text-lg">報告</h2>
        <p className="leading-relaxed">
          全ての実験項目を完了次第、クラウドワークスにて連絡をお願いします。
          <br />
          回答を確認次第、承認させていただきます。
        </p>
      </section>
    </div>
  );
}
