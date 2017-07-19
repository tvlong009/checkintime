/**
 * Created by GUMI-QUANG on 4/28/16.
 */
var moment = require('moment');
var is = require('is_js');
var parseDate = function (d, point) { return is.not.empty(d) ? point === 1? moment(moment(d).endOf("day").valueOf()) : moment(d) : undefined};

module.exports = function (app, router) {

  //Get list time tracking
  router.route('/')
      .get(function (req, res) {
        var fromDate = parseDate(req.query.dateStart, 0),
            toDate = parseDate(req.query.dateEnd, 1),
            staffId = req.query.staffId,
            type = req.query.type,
            pageNumber = req.query.pageNumber,
            limit = req.query.limit;

        var critical = {};

        //If filter by staff
        if (is.not.empty(staffId)) {
          critical["staffId"] = staffId;
        }

        //If filter by check in
        if (type === "checkIn") {
          critical['dateIn'] = {$ne: null};
        }

        //If filter by check out
        if (type === "checkOut") {
          critical['dateOut'] = {$ne: null};
        }

        if (type === "checkIn" && fromDate) {
          //If filter by check in and date start
          critical['dateIn'] = {
            '$gte': fromDate
          };

          //If filter by check in, date start and data end
          if (toDate) {
            critical['dateIn']['$lte'] = toDate;
          }
        } else if (type === "checkOut" && fromDate) {
          //If filter by check out and date start
          critical['dateOut'] = {
            '$gte': fromDate
          };

          //If filter by check out, date start and data end
          if (toDate) {
            critical['dateOut']['$lte'] = toDate;
          }
        } else if (fromDate || toDate) {
          //If filter date start
          if (fromDate) {
            critical['updatedAt'] = {
              '$gte': fromDate
            };
          }

          //If filter date end
          if (toDate) {
            //If object have not init yet
            if (!critical['updatedAt']) {
              critical['updatedAt'] = {};
            }

            critical['updatedAt']['$lte'] = toDate;
          }
        }


        TimeTracking
            .find(critical)
            .sort({
              updatedAt: "desc"
            })
            .populate("staffId")
            .then(function (data) {
              console.log(critical);

              var total = data.length;
              var dataPaging = limit === "all" ? data : data.slice((pageNumber - 1) * limit, pageNumber * limit);
              res.json({
                time: Date.now(),
                total: total,
                data: dataPaging,
                message: "get list success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "internal error"
              });
            })
      });


  //Get time tracking detail
  router.route('/:id')
      .get(function (req, res) {
        TimeTracking
            .findById(req.params.id)
            .populate("staffId")
            .then(function (data) {
              res.json({
                data: data,
                message: "Get user log success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "Internal error"
              });
            })
      });



  //Staff check in
  router.route("/")
      .post(function (req, res) {
        var staffId = req.body.staffId;

        //Check staff exists first
        Staff
            .findById(staffId)
            .then(function (staff) {
              staff.state = local.checkIn; //check in
              staff.save();

              return TimeTracking.create({
                staffId: staff._id,
                state: staff.state,
                dateIn: Date.now(),
                motivationCheckIn: req.body.motivation
              });
            })
            .then(function (result) {
              res.json({
                date: result.dateIn,
                message: "check in success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "internal error"
              });
            });
      });



  //Staff check out
  router.route("/")
      .put(function (req, res) {
        var staffId = req.body.staffId;
        var state = local.checkOut;
        //Check staff exists first
        Staff
            .findById(staffId)
            .then(function (staff) {
              staff.state = state;//Check out
              return staff.save();
            })
            .then(function (staff) {
              return TimeTracking
                  .find({staffId: staff._id})
                  .sort({
                    updatedAt: 'desc'
                  })
                  .limit(1);
            })
            .then(function (timeTracking) {
              if (timeTracking.length > 0) {
                timeTracking[0].dateOut = Date.now();
                timeTracking[0].state = state;
                timeTracking[0].updatedAt = timeTracking[0].dateOut;
                timeTracking[0].motivationCheckOut = req.body.motivation;
                timeTracking[0].save();

                return timeTracking[0];
              } else {
                return Promise.reject("You never checkout before.");
              }
            })
            .then(function (result) {
              res.json({
                date: result.dateOut,
                message: "check out success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "You do not check in yet"
              });
            });
      });


  //Delete log by id and update status user
  router.route('/:id')
      .delete(function (req, res) {
        var state = local.checkDefault,
            staffId = "";

        TimeTracking
            .findById(req.params.id)
            .then(function (t) {
              staffId = t.staffId;
              return TimeTracking
                  .find({staffId: staffId})
                  .sort({
                    updatedAt: "desc"
                  })
                  .limit(2);//to check if data have more
            })
            .then(function (hs) {
              //If have more than 1 it mean user have check log other turn back user just created new one
              if (hs.length > 1) {
                state = hs[1].state;
              }

              return Staff
                  .findByIdAndUpdate(staffId, {state: state});
            })
            .then(function () {
              return TimeTracking
                  .findByIdAndRemove(req.params.id);
            })
            .then(function (result) {
              res.json({
                data: result,
                message: "delete success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "internal error"
              });
            });
      });



  //Admin check for staff
  router.route("/add-tracking")
      .post(function (req, res) {
        var staffId = req.body.staffId;
        var dateIn = req.body.dateIn;
        var dateOut = req.body.dateOut;
        var state = local.checkDefault;

        var obj = {staffId: staffId};

        //Request check in
        if (dateIn && dateIn != "") {
          obj.dateIn = new Date(dateIn);
          obj.createdAt = obj.dateIn;
          obj.updatedAt = obj.dateIn;
          state = local.checkIn;
          obj.state = state;

          //If checkout have we need to change status of user to checkout
          if (dateOut && dateOut != "") {
            obj.dateOut = new Date(dateOut);
            state = local.checkOut;
            obj.updatedAt = obj.dateOut;
            obj.state = state;
          }

          TimeTracking
              .find({staffId: staffId})
              .sort({
                updatedAt: "desc"
              })
              .limit(1)
              .then(function (timeTrackings) {
                if (timeTrackings.length > 0) {
                  var t = timeTrackings[0];
                  var tIn = new Date(t.dateIn).getTime();
                  if (obj.dateIn.getTime() >= tIn) {
                    state = local.checkIn;
                    if (dateOut && dateOut != "") {
                      state = local.checkOut;
                    }
                  }else{
                    if(t.dateOut){
                      state = local.checkOut;
                    }else{
                      state = local.checkIn;
                    }
                  }
                }

                return TimeTracking.create(obj);
              })
              .then(function () {
                return Staff
                    .findByIdAndUpdate(staffId, {state: state});
              })
              .then(function (result) {
                res.json({
                  data: result,
                  message: "Added data success"
                });
              })
              .catch(function (error) {
                res.status(500).json({
                  error: error,
                  message: "You do not have permission to create"
                });
              });
        } else {
          res.status(500).json({
            message: "This function require check in first"
          });
        }

      });



  //update by admin
  router.route("/update-tracking")
      .post(function (req, res) {
        var id = req.body.id;
        var dateIn = req.body.dateIn;
        var dateOut = req.body.dateOut;
        var state = local.checkDefault;
        var staffId = "";

        //Check staff exists first
        TimeTracking
            .findById(id)
            .then(function (timeTracking) {
              staffId = timeTracking.staffId;
              if (dateIn && dateIn != "") {
                timeTracking.dateIn = new Date(dateIn);
                timeTracking.state = local.checkIn;
                timeTracking.updatedAt = new Date(dateIn);
                if (dateOut && dateOut != "") {
                  timeTracking.dateOut = new Date(dateOut);
                  timeTracking.updatedAt = new Date(dateOut);
                  timeTracking.state = local.checkOut;
                }
              }

              return timeTracking.save();
            })
            .then(function () {
              return TimeTracking
                  .find({staffId: staffId})
                  .sort({
                    updatedAt: "desc"
                  })
                  .limit(1);
            })
            .then(function (tt) {
              return Staff
                  .findByIdAndUpdate(staffId, {state: tt[0].state});
            })
            .then(function (result) {
              res.json({
                data: result,
                message: "Update data success"
              });
            })
            .catch(function (error) {
              res.status(500).json({
                error: error,
                message: "You do not have permission"
              });
            });

      });

};