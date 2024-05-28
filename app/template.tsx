import { createClient } from "@/utils/supabase/server";
import NavBarDrawer from "@/app/NavBarDrawer";
import { prisma } from "@/app/lib/prisma";

export default async function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = user !== null;

  let respondent;
  if (isLoggedIn) {
    // ログインした状態でサーバーを閉じて、再度サーバーを立ち上げてアクセスするとprismaがdbに接続できないエラーが生じる。
    // 再読み込みすると問題なく表示された。
    // .vscodeを削除するとエラーが生じなくなった。
    respondent = await prisma.respondents.findUnique({
      where: {
        auth_id: user.id,
      },
    });
  }

  return (
    <>
      <NavBarDrawer isLoggedIn={isLoggedIn} respondent={respondent!} />
      <div className="mt-32 mb-16 max-w-screen-md">{children}</div>
    </>
  );
}
