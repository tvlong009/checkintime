app.controller("TrackingStaffDetailCtrl",
    ["$scope", "$state", "$timeout", "RestApi", "dialogServices", "socket",
      function ($scope, $state, $timeout, RestApi, dialogServices, socket) {

        $scope.action = $state.params.action;
        $scope.timeTracking = {
          dateIn: "",
          dateOut: "",
          staffId: ""
        };

        var getTimeTracking = function () {
          dialogServices.showLoadingDialog();
          RestApi
              .timeTracking()
              .get({id: $state.params.id})
              .$promise
              .then(function (result) {
                $timeout(function () {
                  var data = result.data;
                  if (data.dateIn) {
                    data.dateIn = new Date(data.dateIn);
                  }
                  if (data.dateOut) {
                    data.dateOut = new Date(data.dateOut);
                  }
                  data.staff = data.staffId;
                  data.staffId = "";
                  $scope.timeTracking = data;
                  dialogServices.hide();
                }, 0);
              })
              .catch(function (error) {
                dialogServices.showAlertDialog("warning", error.data.message, "ok");
              });
        };


        var getStaffList = function () {
          dialogServices.showLoadingDialog();
          RestApi
              .staff()
              .get()
              .$promise
              .then(function (result) {
                $scope.staffs = result.data;
                $timeout(function () {
                  $scope.staffs = result.data;
                  dialogServices.hide();
                }, 0);
              })
              .catch(function (error) {
                dialogServices.showAlertDialog("warning", error.data.message, "ok");
              });
        };


        if ($scope.action == "add") {
          getStaffList();
        } else {
          getTimeTracking();
        }


        $scope.update = function(){
          if($scope.timeTracking.dateOut != "" && (new Date($scope.timeTracking.dateOut)).getTime() < (new Date($scope.timeTracking.dateIn)).getTime() ){
            return dialogServices.showAlertDialog("warning", "You must select date check out bigger than date check in", "ok");
          }
          RestApi
              .timeTracking()
              .updateTracking({
                id: $scope.timeTracking._id,
                dateIn: $scope.timeTracking.dateIn,
                dateOut: $scope.timeTracking.dateOut
              })
              .$promise
              .then(function (result) {
                $timeout(function () {
                  dialogServices
                      .showAlertDialog("Congratulation!!!", result.message, "ok")
                      .then(function(){
                        socket.emit("refresh-data");
                        $state.go('admin.tracking-staff');
                      });
                }, 0);
              })
              .catch(function (error) {
                dialogServices.showAlertDialog("warning", error.data.message, "ok");
              });
        };

        $scope.add = function(){
          if($scope.timeTracking.staffId.length > 0){
            if($scope.timeTracking.dateIn != ""){
              if($scope.timeTracking.dateOut != "" && (new Date($scope.timeTracking.dateOut)).getTime() < (new Date($scope.timeTracking.dateIn)).getTime() ){
                return dialogServices.showAlertDialog("warning", "You must select date check out bigger than date check in", "ok");
              }
              RestApi
                  .timeTracking()
                  .addTracking({
                    staffId: $scope.timeTracking.staffId,
                    dateIn: $scope.timeTracking.dateIn,
                    dateOut: $scope.timeTracking.dateOut
                  })
                  .$promise
                  .then(function (result) {
                    $timeout(function () {
                      dialogServices
                          .showAlertDialog("Congratulation!!!", result.message, "ok")
                          .then(function(){
                            socket.emit("refresh-data");
                            $state.go('admin.tracking-staff');
                          });
                    }, 0);
                  })
                  .catch(function (error) {
                    dialogServices.showAlertDialog("warning", error.data.message, "ok");
                  });
            }else{
              dialogServices.showAlertDialog("warning", "Please select date check in", "ok");
            }
          }else{
            dialogServices.showAlertDialog("warning", "Please select staff", "ok");
          }
        };

        $scope.deleteTimeWorking = function(){
          RestApi
              .timeTracking()
              .delete({id: $scope.timeTracking._id})
              .$promise
              .then(function (result) {
                $timeout(function () {
                  dialogServices
                      .showAlertDialog("Congratulation!!!", result.message, "ok")
                      .then(function(){
                        socket.emit("refresh-data");
                        $state.go('admin.tracking-staff');
                      });

                }, 0);
              })
              .catch(function (error) {
                dialogServices.showAlertDialog("warning", error.data.message, "ok");
              });
        };

        $scope.isOpen1 = false;
        $scope.isOpen2 = false;
        $scope.openCalendar = function(e, i) {
          $scope["isOpen"+i] = true;
        };
      }]);
