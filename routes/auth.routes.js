import express from "express";
import * as auth from "../controller/auth.controller.js";

const router = express.Router();

router.post("/register", auth.registerUser);

router.get("/getMe", auth.getMe);
export default router;
