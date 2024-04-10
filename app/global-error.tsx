"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <h2>エラー</h2>
        <button type="button" onClick={() => reset()}>
          再アクセス
        </button>
      </body>
    </html>
  );
}
