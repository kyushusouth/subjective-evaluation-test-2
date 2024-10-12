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
        <h2 className="text-lg">練習試行（明瞭性・自然性）</h2>
        <p className="leading-relaxed">
          練習試行（明瞭性・自然性）は、本番試行（明瞭性・自然性）の前に行っていただく練習のための実験となります。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">
            練習試行（明瞭性・自然性）
          </span>
          をクリックいただくことで回答ページにアクセス頂けます。
          <br />
          こちらは何度行っていただいても構いませんので、こちらを通して実験内容の把握をお願い致します。
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">本番試行（明瞭性・自然性）</h2>
        <p className="leading-relaxed">
          本番試行（明瞭性・自然性）は、練習試行（明瞭性・自然性）の後に行っていただく本番の実験になります。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">
            本番試行（明瞭性・自然性）
          </span>
          をクリックいただくことで回答ページにアクセス頂けます。
          <br />
          練習試行（明瞭性・自然性）を一度も行っていない場合は選択できなくなっていると思いますが、そのような仕様のため問題ありません。練習試行（明瞭性・自然性）を一度完了しますと、選択可能になります。
          <br />
          <span className="font-bold">
            一度提出しますと、回答の修正は不可能となりますのでご注意ください。
          </span>
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">練習試行（類似性）</h2>
        <p className="leading-relaxed">
          練習試行（類似性）は、本番試行（類似性）の前に行っていただく練習のための実験となります。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">練習試行（類似性）</span>
          をクリックいただくことで回答ページにアクセス頂けます。
          <br />
          こちらは何度行っていただいても構いませんので、こちらを通して実験内容の把握をお願い致します。
          <br />
          本番試行（明瞭性・自然性）の回答を終えなければ、本ページにはアクセスできないようになっておりますので、その順で実施いただきますようよろしくお願い致します。
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">本番試行（類似性）</h2>
        <p className="leading-relaxed">
          本番試行（類似性）は、練習試行（類似性）の後に行っていただく本番の実験になります。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">本番試行（類似性）</span>
          をクリックいただくことで回答ページにアクセス頂けます。
          <br />
          練習試行（類似性）を一度も行っていない場合は選択できなくなっていると思いますが、そのような仕様のため問題ありません。練習試行（類似性）を一度完了しますと、選択可能になります。
          <br />
          <span className="font-bold">
            一度提出しますと、回答の修正は不可能となりますのでご注意ください。
          </span>
          <br />
          本番試行（明瞭性・自然性）の回答を終えなければ、本ページにはアクセスできないようになっておりますので、その順で実施いただきますようよろしくお願い致します。
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">エラーが起きた時の対処方法</h2>
        <p className="leading-relaxed">
          サーバーの不調により、エラーが起きる場合がございます。この場合、「エラーが発生しました。」と表示されるページに遷移しますので、ご承知おきください。
        </p>
        <div>
          <p className="leading-relaxed">
            エラーが発生した場合には、必ず以下の手順で対応してください。
          </p>
          <ol className="leading-relaxed list-decimal list-inside">
            <li>一度ページを閉じて、再度ホームページにアクセスする。</li>
            <li>ページをリロードする。</li>
          </ol>
        </div>
        <div>
          <p className="leading-relaxed">
            アンケートや練習試行、本番試行の提出中に生じたエラーについて、以下の二つのパターンが考えられます。
          </p>
          <ol className="leading-relaxed list-decimal list-inside">
            <li>提出処理が完了した後で生じた場合。</li>
            <li>提出処理が完了する前に生じた場合。</li>
          </ol>
          <br />
          <p className="leading-relaxed">
            提出処理が完了した後で生じた場合、リロードすることでメニューの状態が更新されます。例えば、アンケートや本番試行は選択不可能になります。一度目の練習試行を終えた後であれば、本番試行が選択可能になっています。この場合、提出は正常に完了しておりますので、問題ございません。
            <br />
            一方、提出処理が完了する前に生じた場合、リロードしてもメニューの状態が変わりません。この場合、誠に申し訳ありませんが、再度提出をよろしくお願い致します。
          </p>
        </div>
      </section>
    </div>
  );
}
