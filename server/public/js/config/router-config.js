app.config([
  "$stateProvider", "$urlRouterProvider", "$locationProvider",
  function($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
      .state("login",{
        url: "/login",
        templateUrl: "views/login.html",
        controller: "LoginCtrl",
        onEnter: function(){},
        data:{
          pageTitle:"Login"
        }
      })
      .state("change-password",{
        url: "/change-password",
        templateUrl: "views/change-password.html",
        controller: "ChangePasswordCtrl",
        onEnter: function(){},
        data:{
          pageTitle:"Change password"
        }
      })
      .state("admin",{
        abstract: true,
        url: "/admin",
        templateUrl: "views/root.html",
        controller: "RootCtrl",
        onEnter: function(){},
        data:{
          pageTitle:"home"
        }
      })
      .state('admin.tracking-staff', {
        url: "/tracking-staff",
        templateUrl: "views/dashboard.html",
        controller: "TrackingStaffCtrl",
        onEnter: function(){},
        data:{
          pageTitle:"staffs"
        }
      })
      .state('admin.tracking-staff-detail', {
        url: "/tracking-staff-detail/:action/:id",
        templateUrl: "views/detail.html",
        controller: "TrackingStaffDetailCtrl",
        onEnter: function(){},
        data:{
          pageTitle:"staff check detail"
        }
      });
    
    $urlRouterProvider.otherwise("/login");

  $locationProvider.html5Mode(true);
}]);
