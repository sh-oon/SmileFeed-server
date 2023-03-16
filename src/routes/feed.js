const express = require("express");
const { argumentCheck } = require("../common.js");
const router = express.Router();
const response = require("../common.js").response;
const mongo = require("../mongo/mongo.js");
require("dotenv").config();

router.post("/diary", async (req, res) => {
  argumentCheck(res, [req.tokenInfo._id]);
  const user = await mongo.User.findById(req.tokenInfo._id);

  if (!user)
    return response(res, 404, { message: "존재하지 않는 유저입니다." });

    // 현재 날짜
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const today = year + "-" + month + "-" + day;

  const diary = new mongo.Diary({
    userID: user.userID,
    title: req.body.title,
    content: req.body.content,
    date: today,
    emotion: req.body.emotion,
    image: req.body.image,
    thumbnail: req.body.thumbnail,
  });
  let feed = await diary.save();
  console.log(feed);
  response(res, 200, {
    message: "피드 등록 성공",
  });
});

router.get("/diary", async (req, res) => {
  argumentCheck(res, [req.tokenInfo._id]);
  const user = await mongo.User.findById(req.tokenInfo._id);
  let feeds = await mongo.Diary.find({ userID: user.userID });
  console.log(feeds);
  response(res, 200, {
    message: "피드 조회 성공",
    data: feeds
  })
});

module.exports = router;
