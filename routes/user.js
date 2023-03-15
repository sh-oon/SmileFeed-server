const express = require("express");
const router = express.Router();
import { response } from "../common.js";
const mongo = require("../mongo/mongo.js");
require("dotenv").config();
const jwt = require("jsonwebtoken");

router.post("/profile", async (req, res) => {
  const user = await mongo.User.findById(req.tokenInfo._id);

  if (!user) 
    return response(res, 404, { message: "존재하지 않는 유저입니다." });
  
  response(res, 200, {
    message: "프로필 조회 성공",
    data: {
      email: user.email,
      name: user.name,
      mobile: user.mobile,
      birth: user.birth,
    }
  });
});

module.exports = router;
