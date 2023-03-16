const express = require("express");
const { argumentCheck } = require("../common.js");
const router = express.Router();
const response = require("../common.js").response;
const mongo = require("../mongo/mongo.js");
require("dotenv").config();

router.post("/profile", async (req, res) => {
  argumentCheck(res, [req.tokenInfo._id]);
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
