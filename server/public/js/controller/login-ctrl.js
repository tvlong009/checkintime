app.controller("LoginCtrl",
    ["$scope", "$state", "$timeout", "RestApi", "dialogServices",
      function ($scope, $state, $timeout, RestApi, dialogServices) {
        $scope.user = {
          username: "",
          password: ""
        };

        localStorage.removeItem("token");
        dialogServices.hide();
        $scope.auth = function () {
          RestApi
              .auth()
              .save($scope.user)
              .$promise
              .then(function (result) {
                localStorage.setItem("token", result.token);
                $state.go("admin.tracking-staff");
              })
              .catch(function (err) {
                dialogServices.showAlertDialog("Error", err.message, "ok");
              })
        }
      }]);
