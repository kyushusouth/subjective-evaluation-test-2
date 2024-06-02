"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import logout from "@/app/lib/logout";
import { Respondents } from "@prisma/client";

function Drawer({ respondent }: { respondent: Respondents }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPathname = usePathname();

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
        className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-neutral-50 rounded-lg hover:bg-gray-500/50 focus:outline-none focus:ring-2 focus:ring-neutral-200"
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
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 1h15M1 7h15M1 13h15"
          />
        </svg>
      </button>

      {isOpen && (
        <button
          type="button"
          className="size-full fixed inset-0 bg-black opacity-50 z-40"
          onClick={handleClose}
        >
          {/* オーバーレイ */}
        </button>
      )}

      <div
        id="drawer-navigation"
        className={clsx(
          "fixed top-0 right-0 z-50 h-screen py-10 px-6 overflow-y-auto transition-transform bg-white w-80 lg:w-1/4",
          {
            "translate-x-full": !isOpen,
          },
        )}
        aria-labelledby="drawer-navigation-label"
      >
        <div className="flex flex-row justify-between items-center">
          <div id="drawer-navigation-label" className="text-base">
            メニュー
          </div>
          <button
            type="button"
            data-drawer-hide="drawer-navigation"
            aria-controls="drawer-navigation"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center"
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
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="py-4 overflow-y-auto flex flex-col justify-center items-start divide-y divide-gray-100">
          <ul className="w-full py-2">
            <li>
              <Link
                href="/"
                className={clsx(
                  "block px-4 py-2 hover:text-blue-700 hover:bg-gray-100",
                  {
                    "text-blue-700 bg-gray-100": currentPathname === "/",
                  },
                )}
              >
                HOME
              </Link>
            </li>
            <li>
              <Link
                href="/info"
                className={clsx(
                  "block px-4 py-2",
                  {
                    "text-blue-700 bg-gray-100": currentPathname === "/info",
                  },
                  {
                    "text-black hover:text-blue-700 hover:bg-gray-100":
                      !respondent.is_finished_info,
                  },
                  {
                    "text-gray-400 pointer-events-none":
                      respondent.is_finished_info,
                  },
                )}
              >
                アンケート
              </Link>
            </li>
            <li>
              <Link
                href="/eval_practice"
                className={clsx(
                  "block px-4 py-2 hover:text-blue-700 hover:bg-gray-100",
                  {
                    "text-blue-700 bg-gray-100":
                      currentPathname === "/eval_practice",
                  },
                )}
              >
                練習試行
              </Link>
            </li>
            <li>
              <Link
                href="/eval_1"
                className={clsx(
                  "block px-4 py-2 hover:text-blue-700 hover:bg-gray-100",
                  {
                    "text-blue-700 bg-gray-100": currentPathname === "/eval_1",
                  },
                  {
                    "text-black hover:text-blue-700 hover:bg-gray-100":
                      !respondent.is_finished_eval_1 &&
                      respondent.is_finished_practice,
                  },
                  {
                    "text-gray-400 pointer-events-none":
                      respondent.is_finished_eval_1 ||
                      !respondent.is_finished_practice,
                  },
                )}
              >
                本番試行
              </Link>
            </li>
          </ul>
          <div className="w-full py-2">
            <form action={logout}>
              <button
                type="submit"
                className="px-4 py-2 w-full text-left hover:text-blue-700 hover:bg-gray-100"
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

export default function NavBar({
  isLoggedIn,
  respondent,
}: {
  isLoggedIn: boolean;
  respondent: Respondents | undefined;
}) {
  return (
    <nav className="fixed w-screen bg-cyan-600 px-10 z-50">
      <div className="max-w-screen-md flex flex-wrap items-center justify-between py-8 mx-auto">
        <Link href="/" className="text-neutral-50">
          主観評価実験
        </Link>
        {isLoggedIn && <Drawer respondent={respondent!} />}
      </div>
    </nav>
  );
}
