import express from "express";
import connectDB from "../config/connectDB.js";
import authRouter from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";

connectDB();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);

app.listen(3000, () => {
  console.log("server started listening to port 3000");
});
