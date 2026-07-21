import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";

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

  const session = await sessionModel.create({
    user: createdUser._id,
    // refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const refreshToken = jwt.sign(
    { id: createdUser._id, sessionId: session._id },
    config.JWT_KEY,
    {
      expiresIn: "7d",
    },
  );

  const accessToken = jwt.sign(
    { id: createdUser._id, sessionId: session._id },
    config.JWT_KEY,
    {
      expiresIn: "1d",
    },
  );

  const refreshSalt = await bcrypt.genSalt(10);
  const createdRefreshTokenHash = await bcrypt.hash(refreshToken, refreshSalt);

  session.refreshTokenHash = createdRefreshTokenHash;
  await session.save();

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
    accessToken: accessToken,
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
  const session = await sessionModel.findById(decoded.sessionId);

  if (!session || session.revoke) {
    return res.status(400).json({ message: "session not found" });
  }

  const isValid = await bcrypt.compare(
    oldRefreshToken,
    session.refreshTokenHash,
  );
  if (!isValid) {
    return res.status(400).json({ message: "invalid refresh token" });
  }

  const newRefreshToken = jwt.sign(
    { id: decoded.id, sessionId: session._id },
    config.JWT_KEY,
    {
      expiresIn: "7d",
    },
  );

  const newAccessToken = jwt.sign(
    { id: decoded.id, sessionId: session._id },
    config.JWT_KEY,
    {
      expiresIn: "15m",
    },
  );

  const salt = await bcrypt.genSalt(10);
  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, salt);

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

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

export const logout = async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(accessToken, config.JWT_KEY);

  const session = await sessionModel.findById(decoded.sessionId);
  if (!session) {
    return res.status(400).json({ message: "session not found" });
  }

  session.revoke = true;
  await session.save();

  res.clearCookie("refreshToken");
  res.status(200).json({ message: "logged out successfully" });
};
