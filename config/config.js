import dotenv from "dotenv";
dotenv.config();

const config = {
  MONGO_URI: process.env.DB_URI,
  MONGO_NAME: process.env.MONGO_NAME,
  JWT_KEY: process.env.JWT_KEY,
};

export default config;
