# 主観評価アプリ

## 開発環境(dev)設定

1. 環境変数の設定

   - .envファイルに開発用の環境変数を設定します。

2. Supabaseの立ち上げ

   - `supabase start` コマンドでSupabaseを立ち上げます。

3. Seedスクリプトの設定

   - `package.json` の `prisma` セクションにある `seed` を以下のように設定します:
     ```json
     "prisma": {
       "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
     }
     ```

5. マイグレーションの実行
   - `npm run migrate-dev` コマンドを実行して、開発環境のデータベースにマイグレーションを適用します。

## 本番環境(prod)設定

1. 環境変数の設定

   - .env.prodファイルに本番用の環境変数を設定します。

2. Seedスクリプトの設定

   - `package.json` の `prisma` セクションにある `seed` を以下のように設定します:
     ```json
     "prisma": {
       "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seedProd.ts"
     }
     ```

3. マイグレーションの実行
   - `npm run migrate-deploy` コマンドを実行して、本番環境のデータベースにマイグレーションを適用します。

## レコード全削除

- `npm run init` コマンドを実行して、データベースの全レコードを削除します。
