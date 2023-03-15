const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// mongoose 연결
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

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
  refreshTokens: [{ token: String, createdAt: { type: Date, expires: '7d', default: Date.now}}],
});


userSchema.pre('save', function (next) {
  let user = this;
  User.findOne({ email: user.email }, function (err, existingUser) {
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
  const token = jwt.sign(
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
  return token;
}

const Diary = new mongoose.Schema({
  userID: String,
  title: String,
  content: String,
  date: String,
  weather: String,
  emotion: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// mongoose 모델
const User = mongoose.model("User", userSchema);


module.exports = {
  User,
};