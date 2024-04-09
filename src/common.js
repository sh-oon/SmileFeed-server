const response = (res, status, data) => {
  res.status(200).send({
    status: status,
    data: data,
  });
}

const argumentCheck = (res, args) => {
  for (let i = 0; i < args.length; i++) {
    if (!args[i]) {
      response(res, 400, { message: "필수 인자가 누락되었습니다." });
      return false;
    }
  }
  return true;
}

module.exports = {
  response,
  argumentCheck,
}