angular
    .module('app')
    .controller("HomeCtrl", function ($scope, ApiService, DialogService, $filter, $interval, socketService) {
      $scope.isMorning = true;
      $scope.staffs = [];



      var runTimer = function () {
        $interval(function () {
          $scope.currentTime = new Date();
          $scope.isMorning = $filter('date')($scope.currentTime, "a").toLowerCase() == "am";
        }, 1000);
      };

      var reloadStaffList = function () {
        DialogService.showLoadingDialog();
        ApiService
            .staff()
            .get()
            .$promise
            .then(function (result) {
              $scope.staffs = result.data;
              DialogService.hide();
            })
            .catch(function (error) {
              DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
            });
      };
      socketService.on("response-refresh-data", function () {
        reloadStaffList();
      });

      $scope.$on("fetch-data", function () {
        reloadStaffList();
      });


      $scope.$on('$ionicView.enter', function () {
        ApiService
            .staff()
            .get()
            .$promise
            .then(function (result) {
              runTimer();
              $scope.staffs = result.data;
            })
            .catch(function (error) {
              DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
            });
      });


      $scope.checkIn = function (e, i, id) {

        DialogService
            .checkTimeDialog(e)
            .then(function (obj) {
              if (obj.checkStatus) {
                if ($scope.staffs[i].state == 1) {
                  DialogService.showAlertDialog("Warning", "You have already checked in", "ok");
                } else {
                  ApiService
                      .timeTracking()
                      .save({staffId: id, motivation: obj.motivation})
                      .$promise
                      .then(function (result) {
                        $scope.staffs[i].state = 1;
                        socketService.emit("check-in", {staffId: id, message: "check-in"});
                        DialogService.showNotificationToast("Check in at: " + $filter('date')(result.date, "hh:mm:ss a"));
                      })
                      .catch(function (error) {
                        DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
                      });
                }
              } else {
                if ($scope.staffs[i].state == 2) {
                  DialogService.showAlertDialog("Warning", "You have already checked out", "ok");
                } else if ($scope.staffs[i].state == 0) {
                  DialogService.showAlertDialog("Warning", "You can\'t check out because you haven\'t check in yet", "ok");
                } else {
                  DialogService.showLoadingDialog();
                  ApiService
                      .timeTracking()
                      .update({staffId: id, motivation: obj.motivation})
                      .$promise
                      .then(function (result) {
                        $scope.staffs[i].state = 2;
                        socketService.emit("check-out", {staffId: id, message: "check-out"});
                        DialogService.showNotificationToast("Check out at: " + $filter('date')(result.date, "hh:mm:ss a"));
                      })
                      .catch(function (error) {
                        DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
                      });
                }
              }
            });

      };

      $scope.destroy = function (e, i, id) {
        swal({
          title: "Do you want to delete?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Delete!",
          closeOnConfirm: false,
          html: false
        }, function () {

          ApiService
              .staff()
              .destroy({staffId: id})
              .$promise
              .then(function () {
                swal("Deleted!",
                    "Delete staff successful!",
                    "success");
                $scope.staffs.splice(i, 1);
                socketService.emit("refresh-data");
              })
              .catch(function (error) {
                swal("Error!", error.message, "error");
              });
        });
      };

      socketService.on("response-check-in", function (data) {
        $scope.staffs.forEach(function (staff) {
          if (staff._id == data.staffId) {
            staff.state = 1;
          }
        });
      });

      socketService.on("response-check-out", function (data) {
        $scope.staffs.forEach(function (staff) {
          if (staff._id == data.staffId) {
            staff.state = 2;
          }
        });
      });
    });
