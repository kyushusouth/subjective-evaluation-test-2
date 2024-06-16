export default async function Index() {
  return (
    <div className="my-10 flex flex-col gap-10">
      <section className="space-y-2 text-base">
        <h1 className="text-xl text-center mb-8">実験について</h1>
        <p className="leading-relaxed">
          この度はお忙しい中実験にご協力いただき、誠にありがとうございます。
          <br />
          本実験で取得したデータは研究における学会発表や論文執筆のために利用しますが、個人を特定できるような処理は一切致しません。
          <br />
          <br />
          以下、実験項目の説明を記載しておりますので、ご確認の上進めていただきますようよろしくお願い致します。
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">メニュー表示</h2>
        <p className="leading-relaxed">
          右上のアイコン（三本線のアイコン）をクリックしていただくと、メニューが表示されます。
          <br />
          以下、各項目について説明しておりますので、ご確認ください。
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">アンケートの回答</h2>
        <p className="leading-relaxed">
          アンケートでは、性別・年齢など回答者様の基本情報をお答えいただきます。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">アンケート</span>
          をクリックいだたくことで回答ページにアクセス頂けます。
          <br />
          <span className="font-bold">
            一度提出しますと、回答の修正は不可能となりますのでご注意ください。
          </span>
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">練習試行</h2>
        <p className="leading-relaxed">
          練習試行は、本番試行の前に行っていただく練習のための実験となります。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">練習試行</span>
          をクリックいただくことで回答ページにアクセス頂けます。
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
          メニューから、
          <span className="font-bold text-blue-700">本番試行</span>
          をクリックいただくことで回答ページにアクセス頂けます。
          <br />
          練習試行を一度も行っていない場合、本番試行を選択できなくなっていると思いますが、そのような仕様のため問題ありません。
          <br />
          練習試行を一度完了しますと、選択可能になります。
          <br />
          <span className="font-bold">
            一度提出しますと、回答の修正は不可能となりますのでご注意ください。
          </span>
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">エラーが起きた時の対処方法</h2>
        <p className="leading-relaxed">
          サーバーの不調により、エラーが起きる場合がございます。この場合、「エラーが発生しました。」と表示されるページに遷移しますので、ご承知おきください。
        </p>
        <p className="leading-relaxed">
          エラーが発生した場合には、必ず以下の手順で対応してください。
          <ol className="leading-relaxed list-decimal list-inside">
            <li>一度ページを閉じて、再度ホームページにアクセスする。</li>
            <li>ページをリロードする。</li>
          </ol>
        </p>
        <p className="leading-relaxed">
          アンケートや本番試行の提出中に生じたエラーについて、アンケートや本番試行の提出処理が完了している場合、リロードするとメニューから選択できなくなります。逆に、リロードしても選択できる場合は、提出処理が完了していない状態でエラーが発生したことになります。この場合、誠に申し訳ありませんが、再度提出をお願い致します。
        </p>
      </section>
    </div>
  );
}
