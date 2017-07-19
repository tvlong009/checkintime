app.factory("dialogServices",
    ['$mdDialog', '$mdToast', '$q', '$translate',
      function ($mdDialog, $mdToast, $q, $translate) {
        var dialogServices = {};
        var hasShowingDialog = false;

        function showDialog(opt) {
          hasShowingDialog = true;
          return $mdDialog.show(opt);
        }

        dialogServices.hide = function () {
          hasShowingDialog = false;
          return $mdDialog.hide();
        };

        dialogServices.hasShowingDialog = function () {
          return hasShowingDialog;
        };

        dialogServices.showWaitingDialog = function (dialogOptions) {
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
              controller: function ($scope, locals) {
                $scope.message = locals.message;
                $scope.title = locals.title;
              },
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


        dialogServices.showAlertDialog = function (title, message, ok_title, ev) {
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

        dialogServices.showNotificationToast = function (message) {

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
              controller: function ($scope) {
                $scope.message = translations[message];
              },
              hideDelay: 1000,
              onComplete: function () {
                deferred.resolve();
              }
            });
          });
          return promise;
        };

        dialogServices.showLoadingDialog = function () {
          return $mdDialog.show({
                templateUrl: 'views/dialog/loading.html',
                clickOutsideToClose: true,
                escapeToClose: true
              }
          );
        };


        dialogServices.showConfirmDialog = function (ev, dialogOptions) {
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
                  controller: function ($scope, $mdDialog, title, message) {
                    $scope.title = title;
                    $scope.message = message;
                    $scope.yes = function () {
                      $mdDialog.hide(true);
                    };
                    $scope.no = function () {
                      $mdDialog.hide(false);
                    };
                  }
                }
            ).then(function (isDelete) {
                  deferred.resolve(isDelete);
                });
          });
          return deferred.promise;
        };

        dialogServices.checkTimeDialog = function (ev) {
          var deferred = $q.defer();

          showDialog({
            templateUrl: 'views/dialog/check-dialog.html',
            clickOutsideToClose: true,
            targetEvent: ev,
            escapeToClose: true,
            bindToController: true,
            controller: function ($scope, $mdDialog) {

              $scope.checkIn = function () {
                $mdDialog.hide(true);
              };

              $scope.checkOut = function () {
                $mdDialog.hide(false);
              };

            }
          }).then(function (isDelete) {
            deferred.resolve(isDelete);
          });
          return deferred.promise;
        };

        return dialogServices;
      }]);
