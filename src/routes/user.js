const express = require("express");
const { argumentCheck } = require("../common.js");
const router = express.Router();
const response = require("../common.js").response;
const mongo = require("../mongo/mongo.js");
require("dotenv").config();

router.get("/profile", async (req, res) => {
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
    },
  });
});

router.get("/setting", async (req, res) => {
  argumentCheck(res, [req.tokenInfo._id]);
  const user = await mongo.User.findById(req.tokenInfo._id);
  const setting = await mongo.Setting.findOne({ userID: user.userID });
  console.log(setting);
  response(res, 200, {
    message: "설정 조회 성공",
    data: {
      userID: setting.userID,
      theme: setting.theme,
      passwordLock: setting.passwordLock,
      alert: setting.alert,
      font: setting.font,
      fontSize: setting.fontSize,
      backgroundColor: setting.backgroundColor,
      syncronize: setting.syncronize,
    },
  });
});

router.put("/setting", async (req, res) => {
  argumentCheck(res, [req.tokenInfo._id]);
  const setting = await mongo.Setting.findById(req.tokenInfo._id);

  if (!setting) {
    return response(res, 404, { message: "존재하지 않는 유저입니다." });
  }

  response(res, 200, {
    message: "설정 수정 성공",
  });
});

module.exports = router;
