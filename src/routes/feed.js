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

  let diary = await mongo.Diary.findOne({
    userID: user.userID,
    date: req.body.targetDate,
  });
  
  if(!diary) {
    diary = new mongo.Diary({
      userID: user.userID,
      title: req.body.title,
      content: req.body.content,
      date: req.body.targetDate,
      emotion: req.body.emotion,
      image: req.body.image,
      thumbnail: req.body.thumbnail,
    });
    await diary.save();
  } else {
    // 이미 피드가 존재할 경우
    // diary 수정
    diary = await mongo.Diary.findOneAndUpdate(
      { userID: user.userID, date: req.body.targetDate },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          emotion: req.body.emotion,
          image: req.body.image,
          thumbnail: req.body.thumbnail,
        },
      },
      { new: true }
    )
  }
  console.log(diary);
    
  response(res, 200, {
    message: "피드 등록 성공",
  });
});

router.get("/diary", async (req, res) => {
  argumentCheck(res, [req.tokenInfo._id]);
  const user = await mongo.User.findById(req.tokenInfo._id);
  let feeds = await mongo.Diary.find({ userID: user.userID });
  // feeds를 날짜 순으로 정렬
  feeds.sort((a, b) => {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });
  // 현재 월과 이전 월, 다음 월을 구분
  let currentMonth = new Date().getMonth() + 1;
  let prevMonth = currentMonth - 1;
  let nextMonth = currentMonth + 1;
  // 현재 월의 feed를 담을 배열
  let currentMonthFeeds = [];
  // 이전 월의 feed를 담을 배열
  let prevMonthFeeds = [];
  // 다음 월의 feed를 담을 배열
  let nextMonthFeeds = [];
  // 현재 월의 feed를 담는다
  for (let i = 0; i < feeds.length; i++) {
    const month = Number(feeds[i].date.split('-')[1]);
    if (month === currentMonth) {
      currentMonthFeeds.push(feeds[i]);
    } else if (month === prevMonth) {
      prevMonthFeeds.push(feeds[i]);
    } else if (month === nextMonth) {
      nextMonthFeeds.push(feeds[i]);
    }
  }
  const result = {
    currentMonthFeeds: currentMonthFeeds,
    prevMonthFeeds: prevMonthFeeds,
    nextMonthFeeds: nextMonthFeeds,
    currentMonth: currentMonth,
  }
  response(res, 200, {
    message: "피드 조회 성공",
    data: result
  })
});

module.exports = router;
