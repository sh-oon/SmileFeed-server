const mongoose = require("mongoose");
const {nanoid} = require("nanoid");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// mongoose 연결
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: 'archive'
  }, (error, db) => {
    if (error) {
      console.log("Error connecting to database", error);
    } else {
      console.log("Connected to database");
    }
  })

// mongoose 연결 확인
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("we're connected!");
});

// mongoose 스키마
const userSchema = new mongoose.Schema({
  userID: {
    type: String,
    default: () => nanoid(10),
    unique: true,
  },
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (email) {
        return User.findOne({email}).exec().then(user => !user);
      },
      message: "Email already exists"
    }
  },
  password: String,
  mobile: String,
  birth: String,
  gender: String,
  refreshTokens: [{token: String, createdAt: {type: Date, expires: '7d', default: Date.now}}],
});


userSchema.pre('save', function (next) {
  let user = this;
  User.findOne({email: user.email}, function (err, existingUser) {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      return next(new Error('Email already exists'));
    }
    next();
  });
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
      // expiresIn: "1h",
    }
  );
}

const diarySchema = new mongoose.Schema({
  userID: String,
  content: String,
  date: String,
  emotion: String,
  image: String,
  thumbnail: String,
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
});

const settingSchema = new mongoose.Schema({
  userID: String,
  theme: String,
  passwordLock: Boolean,
  alert: Boolean,
  font: String,
  fontSize: String,
  backgroundColor: String,
  syncronize: Boolean,
});

// mongoose 모델
const User = mongoose.model("User", userSchema);
const Diary = mongoose.model("Diary", diarySchema);
const Setting = mongoose.model("Setting", settingSchema);


module.exports = {
  User,
  Diary,
  Setting,
};