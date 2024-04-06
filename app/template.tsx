import { createClient } from "@/utils/supabase/server";
import NavBar from "@/app/NavBar";

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
      <NavBar isLoggedIn={isLoggedIn} />
      <div className="mt-32">{children}</div>
    </>
  );
}
