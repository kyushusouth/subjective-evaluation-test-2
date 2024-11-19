/* eslint-disable no-restricted-syntax */

"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

export default function Index() {
  const [isSaved, setIsSaved] = useState<{ [key: string]: boolean }>({});
  const [hasData, setHasData] = useState(false);
  const checkList: Record<string, string> = {
    subjectiveEvaluationTestIntelligibilityFormValues_practice:
      "練習試行（明瞭性）",
    subjectiveEvaluationTestIntelligibilityFormValues_main:
      "本番試行（明瞭性）",
    subjectiveEvaluationTestSimilarityFormValues_practice: "練習試行（類似性）",
    subjectiveEvaluationTestSimilarityFormValues_main: "本番試行（類似性）",
  };

  useEffect(() => {
    const isSavedDefaultValue: { [key: string]: boolean } = {};
    let hasAnyData = false;
    for (const key of Object.keys(checkList)) {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        isSavedDefaultValue[key] = true;
        hasAnyData = true;
      }
    }
    setIsSaved(isSavedDefaultValue);
    setHasData(hasAnyData);
  }, []);

  const handleLocalStorageClear = (key: string) => {
    if (key === "all") {
      for (const k of Object.keys(checkList)) {
        localStorage.removeItem(k);
      }
    } else {
      localStorage.removeItem(key);
    }

    const updatedIsSaved = { ...isSaved };
    if (key === "all") {
      Object.keys(checkList).forEach((k) => {
        updatedIsSaved[k] = false;
      });
    } else {
      updatedIsSaved[key] = false;
    }
    setIsSaved(updatedIsSaved);

    const hasAnyData = Object.keys(checkList).some(
      (k) => localStorage.getItem(k) !== null,
    );
    setHasData(hasAnyData);
  };

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
          <br />
          また、全ての実験を一度に終える必要はなく、各段階ごとに実施していただければ問題ありません。
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
        <p className="leading-relaxed">所要時間: 1分程度</p>
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
        <h2 className="text-lg">練習試行（明瞭性）</h2>
        <p className="leading-relaxed">所要時間: 5分程度</p>
        <p className="leading-relaxed">
          練習試行（明瞭性）は、本番試行（明瞭性）の前に行っていただく練習のための実験となります。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">練習試行（明瞭性）</span>
          をクリックいただくことで回答ページにアクセス頂けます。
          <br />
          こちらは何度行っていただいても構いませんので、こちらを通して実験内容の把握をお願い致します。
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">本番試行（明瞭性）</h2>
        <p className="leading-relaxed">所要時間: 15分程度</p>
        <p className="leading-relaxed">
          本番試行（明瞭性）は、練習試行（明瞭性）の後に行っていただく本番の実験になります。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">本番試行（明瞭性）</span>
          をクリックいただくことで回答ページにアクセス頂けます。
          <br />
          練習試行（明瞭性）を一度も行っていない場合は選択できなくなっていると思いますが、そのような仕様のため問題ありません。練習試行（明瞭性）を一度完了しますと、選択可能になります。
          <br />
          <span className="font-bold">
            一度提出しますと、回答の修正は不可能となりますのでご注意ください。
          </span>
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">練習試行（類似性）</h2>
        <p className="leading-relaxed">所要時間: 5分程度</p>
        <p className="leading-relaxed">
          練習試行（類似性）は、本番試行（類似性）の前に行っていただく練習のための実験となります。
          <br />
          メニューから、
          <span className="font-bold text-blue-700">練習試行（類似性）</span>
          をクリックいただくことで回答ページにアクセス頂けます。
          <br />
          こちらは何度行っていただいても構いませんので、こちらを通して実験内容の把握をお願い致します。
          <br />
          <span className="font-bold">
            本番試行（明瞭性）の回答を終えなければ、本ページにはアクセスできないようになっておりますので、その順で実施いただきますようよろしくお願い致します。
          </span>
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">本番試行（類似性）</h2>
        <p className="leading-relaxed">所要時間: 15分程度</p>
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
        </p>
      </section>

      <hr className="border-t border-gray-300" />

      <section className="space-y-4 text-base">
        <h2 className="text-lg">ローカルストレージについて</h2>
        <p className="leading-relaxed">
          ネットワークやサーバーの不調により、回答結果の提出時にエラーが起こる可能性がございます。これに対し、本実験ではブラウザのローカルストレージという機能を利用し、回答結果を保存させていただくことで、提出に失敗しても回答結果がそのまま残るよう実装しております。そのため、提出に失敗した場合は、以前の回答結果のまま再度提出をお願い致します。
        </p>
        <p className="leading-relaxed">
          また、提出成功時にはローカルストレージをクリアするよう実装しておりますが、例外的に失敗する可能性もございます。以下のボタンが選択可能になっている場合にはデータが残っておりますので、手動で削除をお願い致します。
        </p>
        <ul className="flex flex-col gap-3 items-center mx-auto">
          {Object.keys(checkList).map((key) => (
            <li key={key}>
              <button
                type="button"
                className={clsx("bg-slate-500 text-white py-2 px-4 rounded", {
                  "hover:bg-blue-700": isSaved[key],
                  "cursor-not-allowed bg-slate-500/50": !isSaved[key],
                })}
                onClick={() => handleLocalStorageClear(key)}
              >
                {checkList[key]}のデータを削除
              </button>
            </li>
          ))}
          <li key="all">
            <button
              type="button"
              className={clsx("bg-slate-500 text-white py-2 px-4 rounded", {
                "hover:bg-blue-700": hasData,
                "cursor-not-allowed bg-slate-500/50": !hasData,
              })}
              onClick={() => handleLocalStorageClear("all")}
            >
              全データを削除
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
}
