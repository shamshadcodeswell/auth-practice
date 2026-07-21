import express from "express";
import connectDB from "../config/connectDB.js";
import authRouter from "../routes/auth.routes.js";

connectDB();
const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

app.listen(3000, () => {
  console.log("server started listening to port 3000");
});
