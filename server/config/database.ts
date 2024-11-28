import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT as 'sqlite',
  storage: process.env.DB_STORAGE,
});

export default sequelize;
