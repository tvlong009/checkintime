var db = require("./connection");
var __extends = this.__extends || function (d, b) {
      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      function __() {
        this.constructor = d;
      }

      __.prototype = b.prototype;
      d.prototype = new __();
    };

var BaseModel = (function () {
  function BaseModel() {
    this.createdAt = {type: Date, default: Date.now};
    this.updatedAt = {type: Date, default: Date.now};
    this.delete = {
      type: Boolean,
      default: false
    }
  }

  return BaseModel;
})();

var AdminModel = (function (_super) {
  __extends(AdminModel, _super);
  function AdminModel() {
    _super.call(this);
    this.username = {
      type: String,
      required: true
    };

    this.email = {
      type: String,
      unique: true
    };

    this.password = {
      type: String,
      required: true
    };
  }

  return AdminModel;
})(BaseModel);

var StaffModel = (function (_super) {
  __extends(StaffModel, _super);
  function StaffModel() {
    _super.call(this);
    this.name = {
      type: String,
      required: true
    };

    this.email = {
      type: String,
      unique: true
    };

    this.state = {
      type: Number,
      default: 0// 0: default, 1: check in, 2: checkout
    };

    this.avatarUrl = {
      type: String
    }
  }

  return StaffModel;
})(BaseModel);


var TimeTracking = (function (_super) {
  __extends(TimeTracking, _super);
  function TimeTracking() {
    _super.call(this);

    this.staffId =  {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'staff',
      index: true
    };

    this.dateIn = {
      type: Date,
      index: true
    };

    this.dateOut = {
      type: Date,
      index: true
    };

    this.state = {
      type: Number,
      default: 0// 0: default, 1: check in, 2: checkout
    };

    this.motivationCheckIn = {
      type: Number,
      default: 0// 0: default, 1: check in, 2: checkout
    };

    this.motivationCheckOut = {
      type: Number,
      default: 0// 0: default, 1: check in, 2: checkout
    };
  }

  return TimeTracking;
})(BaseModel);

global.Admin = db.connection.model("admin", new AdminModel());
global.Staff = db.connection.model("staff", new StaffModel());
global.TimeTracking = db.connection.model("time_tracking", new TimeTracking());

