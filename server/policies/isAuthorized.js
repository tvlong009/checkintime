module.exports = function (jwt) {
  return function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['x-access-token-mobile'];
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, function (err, decoded) {
        if (err) {
          //Todo: remove this logic for more security
          if(req.headers['x-access-token-mobile']){
            return next();
          }
          return res.status(403).json({success: false, message: 'Failed to authenticate token.'});
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }
  }
};
