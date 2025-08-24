import { Sequelize } from "sequelize";
const isTest = process.env.NODE_ENV === "test";

const sequelize = new Sequelize(
  (isTest ? process.env.DB_TEST : process.env.DB_OFICIAL)!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    dialect: "mysql",
    logging: !isTest,
  }
);

export default sequelize;
