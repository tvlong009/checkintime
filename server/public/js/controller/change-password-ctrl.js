app.controller("ChangePasswordCtrl",
    ["$scope", "$state", "$timeout", "RestApi", "dialogServices",
      function ($scope, $state, $timeout, RestApi, dialogServices) {
        $scope.user = {
          password: "",
          confirmPassword: "",
          email: ""
        };

        $scope.auth = function () {
          RestApi
              .auth()
              .update($scope.user)
              .$promise
              .then(function (result) {
                localStorage.setItem("token", result.token);
                $state.go("admin.tracking-staff");
              })
              .catch(function (err) {
                $timeout(function(){
                  dialogServices.showAlertDialog("Error", err.message, "ok");
                },0);
              })
        }
      }]);
