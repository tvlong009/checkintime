angular
  .module('app')
  .controller("StaffsCtrl", function ($scope, $rootScope, $q, ApiService, DialogService, FactoryService, ChartService, UtilService) {
    $scope.staffs = [];
    $scope.critical = {
      dateStart:  UtilService.lastWeek,
      dateEnd: UtilService.today,
      limit: 'all'
    };
    var reloadStaffList = function () {
      ApiService
        .staff()
        .get()
        .$promise
        .then(function (staffs) {
          $scope.staffs = staffs.data;
          var asyncQueue = [];

          _.each($scope.staffs , function (staff) {
            $scope.critical.staffId= staff._id;
            asyncQueue.push(ChartService.loadChart($scope.critical));
          });

          return $q.all(asyncQueue);
        })
        .then(function (responseQueue) {
          _.each(responseQueue, function (chartService, i) {
            $scope.staffs[i].chartService = chartService;
          })
        })
        .catch(function (error) {
          DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
        });
    };

    $scope.showChartStaffs = function () {
      reloadStaffList();
    };

    $rootScope.$on("refresh-data", function () {
      reloadStaffList();
    });

    $scope.$on('$ionicView.enter', function () {
      reloadStaffList();
    });

    $scope.setStaff = function (staff) {
      FactoryService.staff = staff;
    }
  });
