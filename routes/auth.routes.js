import express from "express";
import * as auth from "../controller/auth.controller.js";

const router = express.Router();

router.post("/register", auth.registerUser);

router.post("/login", auth.login);

router.get("/getMe", auth.getMe);
export default router;

router.get("/refresh", auth.refreshToken);

router.get("/logout", auth.logout);

router.get("/logout-all", auth.logoutFromAll);
