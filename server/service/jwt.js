var jwtServices = require('jsonwebtoken');

// Generates a token from supplied payload
module.exports.issue = function(payload) {
  return jwtServices.sign(
      payload,
      local.secret, // Token Secret that we sign it with
      {
        expiresIn : local.expiresInMinutes
      }
  );
};

// Verifies token on a request
module.exports.verify = function(token, callback) {
  return jwtServices.verify(
      token,
      local.secret,
      {},
      callback
  );
};
