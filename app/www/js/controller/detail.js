angular
    .module('app')
    .controller("DetailCtrl", function ($scope, $ionicHistory, ApiService, CameraService, CONSTANT, DialogService, $state, $rootScope, socketService) {
      var staffId = $state.params.staffId;
      var takePhoto = false;

      ApiService
          .staff()
          .get({staffId: staffId})
          .$promise
          .then(function (staff) {
            $scope.staff = staff.data;
            $scope.staff.avatarUrl = $scope.staff.avatarUrl.length > 0 ? CONSTANT.apiUrl + "/" + $scope.staff.avatarUrl : "img/camera.png";
          })
          .catch(function (error) {
            DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
          });

      $scope.takePicture = function () {
        CameraService
            .take()
            .then(function (imageData) {
              $scope.staff.avatarUrl = imageData;
              takePhoto = true;
            })
            .catch(function (error) {
              DialogService.showAlertDialog("Error", error, "ok");
            });
      };

      $scope.submit = function () {
        if ($scope.staff.name.length != 0) {
          DialogService.showLoadingDialog();
          var params = {};
          params.name = $scope.staff.name;
          params.staffId = $scope.staff._id;
          if (takePhoto) {
            CameraService
                .send(CONSTANT.apiUrl + "/api/staff/update-with-photo", $scope.staff.avatarUrl, params)
                .then(function (result) {
                  DialogService.showNotificationToast("Update success")
                      .then(function () {
                        $ionicHistory.goBack();
                        socketService.emit("refresh-data");
                        $rootScope.$broadcast("fetch-data");
                      });
                })
                .catch(function (error) {
                  DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
                });
          } else {
            ApiService
                .staff()
                .update(params)
                .$promise
                .then(function (result) {
                  DialogService.showNotificationToast("Update success")
                      .then(function () {
                        $ionicHistory.goBack();
                        socketService.emit("refresh-data");
                        $rootScope.$broadcast("fetch-data");
                      });
                })
                .catch(function (error) {
                  DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
                })
          }
        } else {
          DialogService.showAlertDialog("warning", "Please input name", "ok");
        }
      }
    });
