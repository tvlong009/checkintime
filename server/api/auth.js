module.exports = function (app, router, jwt) {
  router.route('/')
      .post(function (req, res) {

        Admin
            .findOne({username: req.body.username})
            .then(function(admin){

              if(!admin){
                res.status(403).json({success: false, message: 'Authentication failed. User not found.'});
              }else{
                if(admin.password != req.body.password){
                  res.status(403).json({success: false, message: 'Authentication failed. Wrong password.'});
                }else{
                  var token = jwt.issue(admin);
                  // return the information including token as JSON
                  res.json({
                    success: true,
                    message: 'Login success',
                    token: token
                  });
                }
              }
            })
            .catch(function(error){
              res.status(500).json({
                message: "Internal error",
                error: error
              })
            });
      });

  router.route('/')
      .put(function (req, res) {

        Admin
            .findOne({email: req.body.email})
            .then(function(admin){
              if(!admin){
                res.status(403).json({success: false, message: 'Authentication failed. User not found.'});
              }else{
                admin.password = req.body.password;
                return admin.save();
              }
            })
            .then(function(admin){
              var token = jwt.issue(admin);
              res.json({
                success: true,
                message: 'Changed password success',
                token: token
              });
            })
            .catch(function(error){
              res.status(500).json({
                message: "Internal error please try again",
                error: error
              })
            });
      });
};