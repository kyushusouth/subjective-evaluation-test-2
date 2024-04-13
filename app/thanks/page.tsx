"use client";

import { useEffect } from "react";
import redirectToHome from "@/app/thanks/actions";

export default function Page() {
  useEffect(() => {
    const timer = setTimeout(() => {
      redirectToHome();
    }, 3000);
    return () => clearTimeout(timer);
  });
  return (
    <div className="flex flex-col items-center">
      <p className="leading-relaxed text-center text-base">
        提出完了致しました！
        <br />
        ホームページにリダイレクトしますので、そのままお持ちください。
      </p>
    </div>
  );
}
