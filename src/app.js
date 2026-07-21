import express from "express";
import connectDB from "../config/connectDB.js";

connectDB();
const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log("server started listening to port 3000");
});
