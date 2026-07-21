import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (userExists) {
    return res.status(409).json({ message: "username or email already exist" });
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const newUser = {
    username,
    email,
    password: hash,
  };
  const createdUser = await userModel.create(newUser);

  const token = jwt.sign({ id: createdUser._id }, config.JWT_KEY, {
    expiresIn: "1h",
  });
  res.cookie("token", token);
  res.status(201).json({
    message: "user created successfully",
    user: {
      username: createdUser.username,
      email: createdUser.email,
      password: password,
    },
    token: token,
  });
};
