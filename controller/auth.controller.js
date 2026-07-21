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

  const accessToken = jwt.sign({ id: createdUser._id }, config.JWT_KEY, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ id: createdUser._id }, config.JWT_KEY, {
    expiresIn: "7d",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({
    message: "user created successfully",
    user: {
      username: createdUser.username,
      email: createdUser.email,
    },
    accesstoken: accessToken,
  });
};

export const getMe = async (req, res) => {
  const tokenRecieved = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(tokenRecieved, config.JWT_KEY);

  const user = await userModel.findById(decoded.id);
  res.status(200).json({
    message: "fetched successfully",
    user: {
      username: user.username,
      email: user.email,
    },
  });
};

export const refreshToken = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return res.status(401).json({
      message: "refresh token not found",
    });
  }

  const decoded = jwt.verify(oldRefreshToken, config.JWT_KEY);

  const newRefreshToken = jwt.sign({ id: decoded.id }, config.JWT_KEY, {
    expiresIn: "7d",
  });

  const newAccessToken = jwt.sign({ id: decoded.id }, config.JWT_KEY, {
    expiresIn: "15m",
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    message: "access token refreshed",
    accessToken: newAccessToken,
  });
};
