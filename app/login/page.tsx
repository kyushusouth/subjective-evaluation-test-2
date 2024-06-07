/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/jsx-props-no-spreading */

"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import login from "@/app/login/action";
import SubmitButton from "@/app/login/SubmitButton";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="my-10 w-fit mx-auto">
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
            <div className="relative w-full flex items-center">
              <input
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
                id="password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3"
              >
                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
              </button>
            </div>
          </label>
          {searchParams?.message && (
            <div className="text-center">
              <div
                className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
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
