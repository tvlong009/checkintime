angular
    .module('app')
    .factory("DialogService", function($mdDialog, $mdToast, $q, $translate) {
      var DialogService = {};
      var hasShowingDialog = false;

      function showDialog(opt) {
        hasShowingDialog = true;
        return $mdDialog.show(opt);
      }

      DialogService.hide = function () {
        hasShowingDialog = false;
        return $mdDialog.hide();
      };

      DialogService.hasShowingDialog = function () {
        return hasShowingDialog;
      };

      DialogService.showWaitingDialog = function (dialogOptions) {
        var deferred = $q.defer();
        var promise = deferred.promise;

        promise.onComplete = function (fn) {
          promise.then(function () {
            fn();
          });
        };

        $translate([dialogOptions.title, dialogOptions.message]).then(function (translations) {
          showDialog({
            templateUrl: 'views/dialog/waiting-dialog.html',
            targetEvent: dialogOptions.targetEvent,
            controller: ['$scope', 'locals', function ($scope, locals) {
              $scope.message = locals.message;
              $scope.title = locals.title;
            }],
            locals: {title: translations[dialogOptions.title], message: translations[dialogOptions.message]},
            bindToController: true,
            clickOutsideToClose: angular.isUndefined(dialogOptions.clickOutsideToClose) ? false : dialogOptions.clickOutsideToClose,
            escapeToClose: angular.isUndefined(dialogOptions.escapeToClose) ? false : dialogOptions.escapeToClose,
            onComplete: function () {
              deferred.resolve();
            }
          });
        });
        return promise;
      };


      DialogService.showAlertDialog = function (title, message, ok_title, ev) {
        var deferred = $q.defer();
        $translate([title, message, ok_title]).
        then(function (translations) {
          showDialog(
              $mdDialog.alert()
                  .title(translations[title])
                  .content(translations[message])
                  .ok(translations[ok_title])
                  .targetEvent(ev))
              .then(function (answer) {
                deferred.resolve(answer);
              });
        });
        return deferred.promise;
      };

      DialogService.showNotificationToast = function (message) {
        DialogService.hide();
        var deferred = $q.defer();
        var promise = deferred.promise;
        promise.onComplete = function (fn) {
          promise.then(function () {
            fn();
          });
        };
        $translate([message]).then(function (translations) {
          $mdToast.show({
            templateUrl: 'views/dialog/simple-toast.html',
            controller: ['$scope', function ($scope) {
              $scope.message = translations[message];
            }],
            hideDelay: 500,
            onComplete: function () {
              deferred.resolve();
            }
          });
        });
        return promise;
      };

      DialogService.showLoadingDialog = function () {
        return showDialog({
              templateUrl: 'views/dialog/loading.html',
              clickOutsideToClose: false,
              escapeToClose: true
            }
        );
      };


      DialogService.showConfirmDialog = function (ev, dialogOptions) {
        var deferred = $q.defer();

        $translate([dialogOptions.title, dialogOptions.message]).then(function (translations) {
          showDialog({
                templateUrl: 'views/dialog/confirm-dialog.html',
                clickOutsideToClose: false,
                targetEvent: ev,
                escapeToClose: true,
                locals: {
                  title: translations[dialogOptions.title],
                  message: translations[dialogOptions.message]
                },
                bindToController: true,
                controller: ['$scope', '$mdDialog', 'title', 'message', function ($scope, $mdDialog, title, message) {
                  $scope.title = title;
                  $scope.message = message;
                  $scope.yes = function () {
                    $mdDialog.hide(true);
                  };
                  $scope.no = function () {
                    $mdDialog.hide(false);
                  };
                }]
              }
          ).then(function (isDelete) {
            deferred.resolve(isDelete);
          });
        });
        return deferred.promise;
      };

      DialogService.motivationDialog = function (ev) {
        var deferred = $q.defer();

        showDialog({
          templateUrl: 'views/motivation/motivation.html',
          clickOutsideToClose: true,
          targetEvent: ev,
          escapeToClose: true,
          bindToController: true,
          controller: ['$scope', '$mdDialog', function ($scope, $mdDialog) {

            $scope.happiness = function () {
              $mdDialog.hide(true);
            };

            $scope.sadness = function () {
              $mdDialog.hide(false);
            };

          }]
        }).then(function (isDelete) {
          deferred.resolve(isDelete);
        });
        return deferred.promise;
      };

      DialogService.checkTimeDialog = function (ev) {
        var deferred = $q.defer();

        showDialog({
          templateUrl: 'views/dialog/check-dialog.html',
          clickOutsideToClose: true,
          targetEvent: ev,
          escapeToClose: true,
          bindToController: true,
          controller: ['$scope', '$mdDialog', function ($scope, $mdDialog) {
            $scope.isCheck = false;
            var checkStatus = false;

            var checkTime = function (status) {
              $scope.isCheck = true;
              checkStatus = status;
            };

            $scope.checkIn = function () {
              checkTime(true);
            };

            $scope.checkOut = function () {
              checkTime(false);
            };

            $scope.motivation = function (motivation) {
              $mdDialog.hide({motivation: motivation, checkStatus: checkStatus});
              $scope.isCheck = false;
            }

          }]
        }).then(function (obj) {
          deferred.resolve(obj);
        });
        return deferred.promise;
      };

      return DialogService;
    });
