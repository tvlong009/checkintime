angular
    .module('app')
    .controller("AddCtrl", function ($scope, $ionicHistory, ApiService, CameraService, CONSTANT, DialogService, $rootScope, socketService) {
      var takePhoto = false;
      $scope.staff = {
        name: "",
        email: "",
        avatarUrl: "img/camera.png"
      };

      $scope.uploadImageFile = function () {
        var imageUpload = new ImageUploader();
        $scope.file = {};
        $scope.upload = function() {
          imageUpload.push($scope.file, function(data){
            console.log('File uploaded Successfully', $scope.file, data);
            $scope.staff.avatarUrl  = data.url;
            $scope.$digest();
          });
        };
      };

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
        if ($scope.staff.name.length != 0 && $scope.staff.email.length != 0 && takePhoto) {
          DialogService.showLoadingDialog();
          var params = {};
          params.name = $scope.staff.name;
          params.email = $scope.staff.email;
          CameraService
              .send(CONSTANT.apiUrl + "/api/staff", $scope.staff.avatarUrl, params)
              .then(function (result) {
                DialogService
                    .showNotificationToast(result.message || result.data.message)
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
          DialogService.showAlertDialog("warning", "Please input name and your email", "ok");
        }
      }
    });
