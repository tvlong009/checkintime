var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    cors = require('cors'),
    multer = require('multer'),
    port = process.env.PORT || 8080,
    util = require('util'),
    bodyParser = require('body-parser'),
    jwt = require('./service/jwt'),
    upload = multer({
      storage: multer.diskStorage({
        destination: function (req, file, callback) {
          callback(null, './uploads');
        },
        filename: function (req, file, callback) {
          var re = /(?:\.([^.]+))?$/;
          var ext = re.exec(file.originalname)[0];
          callback(null, Date.now() + ext);
        }
      })
    }).single('file');
global.Promise = require('bluebird');
//Bootstrap data
require("./config/local");
require("./db/model");
require("./db/seed");

app.use(cors());
app.set('superSecret', local.secret); // secret variable
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());
app.use("/uploads", express.static('uploads'));

var auth = express.Router();
app.use("/auth", auth);
require("./api/auth")(app, auth, jwt);

var enableAuthorized = require("./policies/isAuthorized")(jwt);

var api = express.Router();
app.use("/api/staff", enableAuthorized, api);
require("./api/staff")(app, api, upload);


var timeTracking = express.Router();
app.use("/api/time-tracking", enableAuthorized, timeTracking);
require("./api/time-tracking")(app, timeTracking);

app.get("/check-in", function(req, res){
  var type = local.checkIn;
  Staff
      .find({state: +type})
      .then(function (data) {
        res.json({
          time: Date.now(),
          data: data,
          message: "Get staff list success"
        });
      })
      .catch(function (error) {
        res.status(500).json({
          error: error,
          message: "Internal error"
        });
      })
});

//Final router for admin page
app.use(express.static('public'));
//Allway return public to client if the server
app.use(function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

server.listen(port, function () {
  console.log("Server started at port " + port);
});


var io = require('socket.io')(server);
io.on('connection', function (socket) {
  //Receive data from sp client
  socket.on('check-in', function (data) {
    socket.broadcast.emit('response-check-in', data);
  });

  socket.on('check-out', function (data) {
    socket.broadcast.emit('response-check-out', data);
  });

  socket.on('refresh-data', function (data) {
    socket.broadcast.emit('response-refresh-data', data);
  });
});




