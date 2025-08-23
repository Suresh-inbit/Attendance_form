// import { Sequelize, DataTypes } from 'sequelize';
// import { createClient } from "@libsql/client";

// import dotenv from 'dotenv';
// dotenv.config('backend/.env');
// const  tursoBase = process.env.TURSO_DATABASE_URL; 
// const tursoToken = process.env.TURSO_AUTH_TOKEN;

// export const turso = createClient({
//   url:tursoBase,
//   authToken: tursoToken,
// });
// // await turso.execute("CREATE TABLE users(name varchar(10), Number int)")
// await turso.execute("SELECT * FROM users");

// const res = await turso.execute({
//   sql: "SELECT * FROM users WHERE id = ?",
//   args: [11],
// });
// console.log(res.rows);