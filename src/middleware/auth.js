// 로그인 미들웨어
// 로그인이 되어있지 않으면 로그인 페이지로 리다이렉트
// 로그인이 되어있으면 다음 미들웨어로 넘어감
const router = require('express').Router();
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  const accessToken = req.headers['authorization'].split(' ')[1];

  if (accessToken == null) {
		res.status(401).json({status: 403, message: 'Authentication fail'});
	} else {
		try {
			const tokenInfo = await new Promise((resolve, reject) => {
				jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, 
					(err, decoded) => {
						if (err) {
							reject(err);
						} else {
							resolve(decoded);
						}
					});
			});
			req.tokenInfo = tokenInfo;
			next();
		} catch(err) {
      res.status(401).json({status: 401, message: '토근이 만료되었습니다.'});
		}
	}
}

module.exports = auth;