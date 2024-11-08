
edit .env

```dotenv
DATABASE_URL="mysql://chronote_user:ChroNote2024!@localhost:3306/chronote"
JWT_SECRET=NyL3gdxIlxuVL8OG1PSP9lrBDO26gZ2fh9GSLY7N9wAvG8pSfid93BjMjY/MtxhldeFHM1hOodycDwvZPwGU5g==
```

```zsh
# install npm package
npm install
# aws lambda への deploy
# npm run deploy
# lcoal 実行
npm run dev

```

```sql
create database chronote;
Create user 'chronote_user'@'%' IDENTIFIED BY 'ChroNote2024!';
GRANT CREATE, DROP, REFERENCES, ALTER ON *.* TO 'chronote_user'@'%';
FLUSH PRIVILEGES;
GRANT ALL PRIVILEGES ON chronote.* TO 'chronote_user'@'%';
FLUSH PRIVILEGES;
```

```zsh
# db 反映
npx prisma db push

# create migrate file (name init で作る)
npx prisma migrate dev --name init
```
