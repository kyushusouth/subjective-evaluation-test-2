# 主観評価アプリ

## 開発環境(dev)設定

1. 環境変数の設定
   .envファイルに開発用の環境変数を設定します。

2. Supabaseの立ち上げ
   `supabase start` コマンドでSupabaseを立ち上げます。

3. Seedスクリプトの設定
   `package.json` の `prisma` セクションにある `seed` を以下のように設定します:

```json
"prisma": {
 "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seedRemake.ts"
}
```

4. マイグレーションの実行
   `npm run migrate-dev` コマンドを実行して、開発環境のデータベースにマイグレーションを適用します。

## 本番環境(prod)設定

1. 環境変数の設定
   .env.prodファイルに本番用の環境変数を設定します。

2. Supabaseローカルインスタンスにおける権限の設定
   以下のコードをSQL Editorで実行することで、publicスキーマに対する権限を変更します。

   ```sql
   GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
   GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
   ```

   参考URL
   <https://github.com/orgs/supabase/discussions/20241>
   <https://supabase.com/docs/guides/api/using-custom-schemas>

3. Seedスクリプトの設定
   `package.json` の `prisma` セクションにある `seed` を以下のように設定します:

   ```json
   "prisma": {
     "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seedProdRemake.ts"
   }
   ```

4. マイグレーションの実行
   `npm run migrate-deploy` コマンドを実行して、本番環境のデータベースにマイグレーションを適用します。

## テーブル全削除

```sql
do $$ declare
    r record;
begin
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists ' || quote_ident(r.tablename) || ' cascade';
    end loop;
end $$;****
```
