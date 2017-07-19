angular
  .module('app')
  .controller("ChartCtrl", function ($scope, $state, $rootScope, ApiService, DialogService, UtilService, FactoryService, ChartService) {

    $scope.staff = FactoryService.staff;
    $scope.critical = {
      staffId: $state.params.staffId,
      dateStart: UtilService.lastWeek,
      dateEnd: UtilService.today,
      limit: 'all'
    };

    $scope.showChart = function () {
      ChartService
        .loadChart($scope.critical)
        .then(function (chartService) {
          $scope.chartService = chartService;
        })
        .catch(function (error) {
          DialogService.showAlertDialog("Error", error.message || error.data.message, "ok");
        })
    };

    $scope.colors = ['#2ecc71', '#f06160'];
    $scope.series = ['Check In', 'Check Out'];
    $scope.options = {
      title: {
        display: true,
        text: 'MOTIVATION BAR CHART'
      },
      legend: {
        display: true,
        position: 'top'
      },

      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 5,
            stepSize: 1
          },
          scaleLabel: {
            display: true,
            labelString: 'MOTIVATION'
          },
          time: {
            unit: 'day'
          }
        }],
        xAxes: [{
          ticks: {
            autoSkip: false,
            maxRotation: 30,
            minRotation: 30
          },
          scaleLabel: {
            display: true,
            labelString: 'DATE TIME'
          }
        }]
      }
    };

    $scope.datasetOverride = [
      {
        label: "Check In",
        borderWidth: 1,
        type: 'bar'
      },
      {
        label: "Check Out",
        borderWidth: 1,
        type: 'bar'
      }
    ];


    $scope.showChart();

  });


