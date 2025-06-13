import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
console.log("Connecting to DB with:", {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_HOST: process.env.DB_HOST,
});

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql", // atau 'postgres', 'sqlite', dsb
    logging: false,
  }
);

export default db;
