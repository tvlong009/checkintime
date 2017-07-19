angular
    .module('app')
    .controller("SettingCtrl", function ($scope, $rootScope, ApiService, DialogService) {
      $scope.staffs = [];

      var reloadStaffList = function () {
        ApiService.staff()
            .get()
            .$promise
            .then(function (staffs) {
              $scope.staffs = staffs.data;
            })
            .catch(function (error) {
              DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
            });
      };


      $rootScope.$on("refresh-data", function () {
        reloadStaffList();
      });

      $scope.$on('$ionicView.enter', function () {
        reloadStaffList();
      });

    });