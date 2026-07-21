import dotenv from "dotenv";
dotenv.config();

const config = {
  MONGO_URI: process.env.DB_URI,
  MONGO_NAME: process.env.MONGO_NAME,
};

export default config;
