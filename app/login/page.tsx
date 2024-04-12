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

// "use client";

// import { useForm, SubmitHandler } from "react-hook-form";
// import { useRouter } from "next/navigation";
// import SubmitButton from "@/app/login/SubmitButton";

// type Inputs = {
//   email: string;
//   password: string;
// };

// export default function Login({
//   searchParams,
// }: {
//   searchParams: { message: string };
// }) {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<Inputs>();
//   const router = useRouter();

//   const onSubmit: SubmitHandler<Inputs> = async (data) => {
//     const response = await fetch("api/login", {
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//       method: "POST",
//     });
//     const result = await response.json();
//     if (result.success) {
//       router.push("/");
//     } else {
//       router.push("/login?message=Failed to authenticate.");
//     }
//   };

//   return (
//     <div className="my-10">
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="flex flex-col justify-center items-center gap-10">
//           <label htmlFor="email" className="w-full">
//             メールアドレス
//             <input
//               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
//               id="email"
//               type="email"
//               {...register("email", { required: true })}
//             />
//           </label>
//           <label htmlFor="password" className="w-full">
//             パスワード
//             <input
//               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
//               id="password"
//               type="password"
//               {...register("password", { required: true })}
//             />
//           </label>
//           {searchParams?.message && (
//             <div className="text-center">
//               <div
//                 className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-400"
//                 role="alert"
//               >
//                 認証に失敗しました。
//                 <br />
//                 正しいメールアドレスとパスワードの入力をお願い致します。
//               </div>
//             </div>
//           )}
//           <SubmitButton>ログイン</SubmitButton>
//         </div>
//       </form>
//     </div>
//   );
// }
