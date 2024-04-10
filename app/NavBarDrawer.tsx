"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import logOut from "@/app/lib/logOut";

function Drawer() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        data-collapse-toggle="navbar-hamburger"
        type="button"
        className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        aria-controls="navbar-hamburger"
        aria-expanded="false"
        onClick={handleOpen}
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
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M1 1h15M1 7h15M1 13h15"
          />
        </svg>
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={handleClose}
        >
          {/* オーバーレイ */}
        </button>
      )}

      <div
        id="drawer-navigation"
        className={clsx(
          "fixed top-0 right-0 z-50 h-screen p-4 overflow-y-auto transition-transform bg-white dark:bg-gray-800 w-80 lg:w-1/4",
          {
            "translate-x-full": !isOpen,
          },
        )}
        tabIndex={-1}
        aria-labelledby="drawer-navigation-label"
      >
        <h5
          id="drawer-navigation-label"
          className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400 z-50"
        >
          メニュー
        </h5>
        <button
          type="button"
          data-drawer-hide="drawer-navigation"
          aria-controls="drawer-navigation"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
          onClick={handleClose}
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
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
      </div>
    </>
  );
}

export default function NavBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    // fixedにより、ページをスクロールしてもナビゲーションバーが動かないようにする
    <nav className="fixed w-screen bg-sky-100 px-10 z-50">
      <div className="max-w-screen-md flex flex-wrap items-center justify-between py-8 mx-auto">
        <Link href="/" className="">
          主観評価実験
        </Link>
        {isLoggedIn && <Drawer />}
      </div>
    </nav>
  );
}
