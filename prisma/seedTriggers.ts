import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

async function main() {
  await sql`
		drop function if exists "handle_new_user" cascade;
	`;
  await sql`
		create or replace function public.handle_new_user()
		returns trigger
		language plpgsql
		security definer set search_path = public
		as $$
		begin
				insert into public."Respondents" (auth_id)
				values (new.id);
				return new;
		end;
		$$;
	`;
  await sql`
		create or replace trigger on_auth_user_created
				after insert on auth.users
				for each row 
				execute procedure public.handle_new_user();
	`;

  await sql`
		drop function if exists "handle_user_delete" cascade;
	`;
  await sql`
		create or replace function public.handle_user_delete()
		returns trigger
		language plpgsql
		security definer set search_path = public
		as $$
		begin
				delete from auth.users where id = old.id;
				return old;
		end;
		$$;
	`;

  await sql`
		create or replace trigger on_profile_user_deleted
		after delete on public."Respondents"
		for each row
		execute procedure public.handle_user_delete()
	`;

  console.log(
    "Finished adding triggers and functions for Respondents handling."
  );
  process.exit();
}

main();
