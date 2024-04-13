/* eslint-disable react/jsx-props-no-spreading */

import login from "@/app/login/action";
import SubmitButton from "@/app/login/SubmitButton";

export default async function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className="my-10">
      <form action={login}>
        <div className="flex flex-col justify-center items-center gap-10">
          <label htmlFor="email" className="w-full">
            メールアドレス
            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
              id="email"
              name="email"
              type="email"
              required
            />
          </label>
          <label htmlFor="password" className="w-full">
            パスワード
            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
              id="password"
              name="password"
              type="password"
              required
            />
          </label>
          {searchParams?.message && (
            <div className="text-center">
              <div
                className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-400"
                role="alert"
              >
                認証に失敗しました。
                <br />
                正しいメールアドレスとパスワードの入力をお願い致します。
              </div>
            </div>
          )}
          <SubmitButton>ログイン</SubmitButton>
        </div>
      </form>
    </div>
  );
}
