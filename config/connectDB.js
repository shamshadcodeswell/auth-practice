import config from "./config";
import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(config.MONGO_URI + "/" + config.MONGO_NAME);
  console.log("connected to the database");
};

export default connectDB;
