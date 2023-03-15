const express = require("express");
const router = express.Router();
import { response } from "../common.js";
const mongo = require("../mongo/mongo.js");
require("dotenv").config();
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userList = await mongo.User.find();
  const user = userList.find((user) => user.email === email);
  if (!user)
    return response(res, 404, { message: "존재하지 않는 유저입니다." });
  if (user.password !== password)
    return response(res, 404, { message: "비밀번호가 일치하지 않습니다." });

  const { accessToken, refreshToken } = await generateTokens(user);
  response(res, 200, {
    message: "로그인 성공",
    data: {
      accessToken,
      refreshToken,
      // expiresIn: 30 * 60 * 1000,
      expiresIn: 30 * 1000,
    },
  });
});

router.post("/register", (req, res) => {
  let userData = req.body;
  const user = new mongo.User({
    email: userData.email,
    password: userData.password,
    name: userData.name,
    mobile: userData.phone,
    birth: userData.birth,
    gender: userData.gender,
  });

  user
    .save()
    .then((result) => {
      console.log("success register", result);
      response(res, 200, { message: "회원가입 성공" });
    })
    .catch((err) => {
      console.log("error register", err);
      response(res, 404, { message: "회원가입 실패" });
    });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return response(res, 401, { message: "로그인이 필요합니다." });
  const user = await mongo.User.findOne({
    refreshTokens: { $elemMatch: { token: refreshToken } },
  });
  if (!user) return response(res, 403, { message: "유효하지 않은 토큰입니다." });
  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    user
  );
  response(res, 200, {
    message: "토큰 갱신 성공",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      // expiresIn: 30 * 60 * 1000,
      expiresIn: 30 * 1000,
    },
  });
});

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    {
      _id: user._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );
  const refreshToken = jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const refreshTokens = user.refreshTokens;
  refreshTokens.push({ token: refreshToken });

  const updated = await mongo.User.findOneAndUpdate(
    { _id: user._id },
    { $set: { refreshTokens: refreshTokens } }
  );

  return { accessToken, refreshToken };
};

// const crypto = require('crypto');

// const generateAccessTokenSecret = () => {
//   return crypto.randomBytes(32).toString('hex');
// };

// const accessTokenSecret = generateAccessTokenSecret();
// const refreshTokenSecret = generateAccessTokenSecret();

module.exports = router;
