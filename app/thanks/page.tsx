"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
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
