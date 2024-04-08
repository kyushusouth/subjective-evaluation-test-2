import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import createInfo from "@/app/info/actions";

export default async function Info() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    redirect("/login");
  }

  const sexItemList = await prisma.sexItem.findMany();
  const respondent = await prisma.respondents.findUnique({
    where: {
      auth_id: user.id,
    },
  });

  return (
    <div className="my-10">
      <form action={createInfo}>
        <div className="flex flex-col justify-center items-center gap-10">
          <label htmlFor="age" className="w-full">
            年齢
            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
              id="age"
              name="age"
              type="number"
              defaultValue={
                respondent?.age === -1 ? undefined : respondent?.age
              }
              required
            />
          </label>
          <label htmlFor="sex" className="w-full">
            性別
            <select
              id="sex"
              name="sex"
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
              defaultValue={respondent?.sex}
            >
              {sexItemList.map((sexItem) => (
                <option key={sexItem.id} value={sexItem.item}>
                  {sexItem.item}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="bg-slate-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            提出する
          </button>
        </div>
      </form>
    </div>
  );
}
