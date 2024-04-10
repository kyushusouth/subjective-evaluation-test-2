import { createClient } from "@/utils/supabase/server";
import NavBarDrawer from "@/app/NavBarDrawer";

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

  return (
    <>
      <NavBarDrawer isLoggedIn={isLoggedIn} />
      <div className="mt-32 mb-16 max-w-screen-md">{children}</div>
    </>
  );
}
