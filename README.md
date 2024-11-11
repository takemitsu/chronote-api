
```zsh
# install npm package
npm install

# deploy to aws lambda
# npm run deploy

# run index.local.ts
npm run dev

# create|copy .env
cp .env.sample .env
```

### edit .env

```dotenv
DATABASE_URL="mysql://chronote_user:ChroNote2024!@localhost:3306/chronote"
JWT_SECRET=NyL3gdxIlxuVL8OG1PSP9lrBDO26gZ2fh9GSLY7N9wAvG8pSfid93BjMjY/MtxhldeFHM1hOodycDwvZPwGU5g==
```

### create database and user

```sql
create database chronote;
Create user 'chronote_user'@'%' IDENTIFIED BY 'ChroNote2024!';
GRANT CREATE, DROP, REFERENCES, ALTER ON *.* TO 'chronote_user'@'%';
FLUSH PRIVILEGES;
GRANT ALL PRIVILEGES ON chronote.* TO 'chronote_user'@'%';
FLUSH PRIVILEGES;
```

テスト用データベース作成

```sql
CREATE DATABASE chronote_test;
GRANT ALL PRIVILEGES ON chronote_test.* TO 'chronote_user'@'%';
FLUSH PRIVILEGES;
```

### migrate|create tables

```zsh
# db 反映
npx prisma migrate dev

# create migrate file (name init で作る)
npx prisma migrate dev --name init

# seed
npm run seed
```

### test db settings

テスト用にマイグレーションをする方法がないので以下の手順で行う

* .env の接続先を `_test` に変更する
* `npx prisma migrate dev` を実行する
* .env の接続先から `_test` を削除し、接続先を戻す。

> 戻し忘れに注意すること
