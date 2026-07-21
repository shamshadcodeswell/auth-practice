import config from "./config.js";
import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(config.MONGO_URI, { dbName: config.MONGO_NAME });
  console.log("connected to the database");
  console.log(mongoose.connection.name);
};
export default connectDB;
