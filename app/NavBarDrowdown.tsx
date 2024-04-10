"use client";

import { useState } from "react";
import Link from "next/link";
import logOut from "@/app/lib/logOut";

export default function NavBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    // fixedにより、ページをスクロールしてもナビゲーションバーが動かないようにする
    <nav className="fixed w-screen bg-sky-100 px-10 z-50">
      <div className="max-w-screen-md flex flex-wrap items-center justify-between py-8 mx-auto">
        <Link href="/" className="">
          主観評価実験
        </Link>

        {isLoggedIn ? (
          <>
            {/* mdより小さいブラウザ幅の場合、ハンバーガー */}
            <button
              data-collapse-toggle="navbar-dropdown"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-dropdown"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>

            {/* md以上のブラウザ幅の場合、ナビゲーションバーを出す */}
            <div
              className="hidden w-full md:block md:w-auto"
              id="navbar-dropdown"
            >
              <ul className="flex flex-wrap gap-10">
                <li className="hover:text-blue-700">
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <button
                    id="dropdownNavbarButton"
                    // className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                    className="flex items-center justify-between w-full hover:text-blue-700"
                    type="button"
                    onClick={handleClick}
                  >
                    メニュー{" "}
                    <svg
                      className="w-2.5 h-2.5 ms-2.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  </button>
                  {/* fixedにより、ドロップダウンメニューの表示によってナビゲーションバーのUIが影響を受けないようにする */}
                  <div
                    id="dropdownNavbar"
                    className={`${isMenuOpen ? null : "hidden"} fixed font-normal text-sm text-gray-700 bg-white divide-y divide-gray-100 rounded-lg shadow w-44`}
                  >
                    <ul className="py-2">
                      <li>
                        <Link
                          href="/info"
                          className="block px-4 py-2 hover:text-blue-700 hover:bg-gray-100"
                        >
                          性別・年齢
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/info"
                          className="block px-4 py-2 hover:bg-gray-100 pointer-events-none line-through"
                        >
                          性別・年齢
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/eval"
                          className="block px-4 py-2 hover:text-blue-700 hover:bg-gray-100"
                        >
                          練習試行
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/eval"
                          className="block px-4 py-2 hover:text-blue-700 hover:bg-gray-100"
                        >
                          本番試行1
                        </Link>
                      </li>
                    </ul>
                    <div className="py-1">
                      <form action={logOut}>
                        <button
                          type="submit"
                          className="block px-4 py-2 w-full text-left hover:text-blue-700 hover:bg-gray-100"
                        >
                          ログアウト
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </nav>
  );
}