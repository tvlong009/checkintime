/**
 * Created by GUMI-QUANG on 4/27/16.
 */
module.exports = function (app, router, upload) {
  router.route('/')
      .get(function (req, res) {
        var limit = req.query.limit || 200,
            page = (req.query.page || 1) - 1;

        var total = 0;

        Staff
            .find()
            .then(function (result) {
              total = result.length;
              return Staff
                  .find()
                  .limit(limit)
                  .skip(limit * page)
                  .sort({
                    updatedAt: 'desc'
                  });
            })
            .then(function (data) {
              res.json({
                time: Date.now(),
                data: data,
                total: total,
                message: "Get staff list success",
                limit: limit,
                nextPage: total > limit * page ? page + 1 : page
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "Internal error"
              });
            })


      });
  

  //Get staff info
  router.route("/:staffId")
      .get(function (req, res) {
        Staff
            .findById(req.params.staffId)
            .then(function (data) {
              res.json({
                data: data,
                message: "Get staff success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "Internal error"
              });
            });
      });

  //Register new staff
  router.route("/")
      .post(function (req, res) {
        upload(req, res, function (error) {
          if (error) {
            res.status(500).json({
              error: error,
              message: "Staff has already exists"
            });
          } else {
            var filePath = req.file ? req.file.path : "",
                name = req.body.name,
                email = req.body.email;

            Staff
                .find({email: email})
                .then(function (data) {
                  if (data.length === 0) {
                    return Staff.create({name: name, email: email, avatarUrl: filePath});
                  }else{
                    return Promise.reject("Staff has already exists");
                  }
                })
                .then(function (staff) {
                  res.json({
                    data: staff,
                    message: "Create staff success"
                  });
                })
                .catch(function (error) {
                  res.status(500).json({
                    error: error,
                    message: "Staff has already exists"
                  });
                });
          }
        });
      });

  //Update staff
  router.route("/")
      .put(function (req, res) {
        Staff
            .update({_id: req.body.staffId}, {$set: req.body})
            .then(function (staff) {
              res.json({
                data: staff,
                message: "Create staff success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "Staff has already exists"
              });
            });
      });

  //Update staff with photo
  router.route("/update-with-photo")
      .post(function (req, res) {
        upload(req, res, function (error) {
          if (error) {
            res.status(500).json({
              error: error,
              message: "Error file uploading"
            });
          } else {
            var filePath = req.file ? req.file.path : "",
                name = req.body.name;

            Staff
                .findById(req.body.staffId)
                .then(function (staff) {
                  staff.name = name;
                  if(filePath.length > 0){
                    staff.avatarUrl = filePath;
                  }
                  return staff.save();
                })
                .then(function (staff) {
                  res.json({
                    data: staff,
                    message: "Update staff success"
                  });
                })
                .catch(function (error) {
                  res.status(500).json({
                    error: error,
                    message: "Internal error"
                  });
                });
          }
        });
      });

  //
  router.route("/photo")
      .post(function (req, res) {
        upload(req, res, function (err) {
          if (err) {
            return res.json({
              message: "Error file uploading."
            });
          }
          res.json({
            message: "File is uploaded",
            path: req.file.path,
            filename: req.file.filename
          });
        });
      });

  //Delete staff
  router.route("/:staffId")
      .delete(function (req, res) {
        var staffId = req.params.staffId;

        Staff
            .findByIdAndRemove(staffId)
            .then(function () {
              return TimeTracking
                  .find({staffId: staffId})
                  .remove();
            })
            .then(function(){
              res.json({
                message: "Delete staff success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "Internal error"
              });
            });
      });
};