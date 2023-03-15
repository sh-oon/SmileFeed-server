const response = (res, stauts, data) => {
  res.status(200).send({
    status: stauts,
    data: data,
  });
}

module.exports = {
  response,
}