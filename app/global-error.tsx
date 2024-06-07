/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { useFormStatus } from "react-dom";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "主観評価実験",
  description: "合成音声の主観評価実験に用いるwebアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { pending } = useFormStatus();
  return (
    <html lang="ja" className={GeistSans.className}>
      <body className="bg-background text-foreground px-10 text-base">
        <div className="flex flex-col items-center mt-28">
          <div
            className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
            role="alert"
          >
            エラーが生じました。
          </div>
        </div>
      </body>
    </html>
  );
}
