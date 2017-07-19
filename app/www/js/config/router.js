angular
    .module('app')
    .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider
          .state('home', {
            url: '/home',
            templateUrl: 'views/home.html',
            controller: 'HomeCtrl',
            controllerAs: '$ctrl'
          })
          .state('detail', {
            url: '/detail/:staffId',
            templateUrl: 'views/detail.html',
            controller: 'DetailCtrl',
            controllerAs: '$ctrl'
          })
          .state('add', {
            url: '/add',
            templateUrl: 'views/add.html',
            controller: 'AddCtrl',
            controllerAs: '$ctrl'
          })
          .state('setting', {
            url: '/setting',
            templateUrl: 'views/setting.html',
            controller: 'SettingCtrl',
            controllerAs: '$ctrl'
          })
          .state('staffs', {
            url: '/staffs',
            templateUrl: 'views/staff-list.html',
            controller: 'StaffsCtrl',
            controllerAs: '$ctrl'
          })
          .state('chart', {
            url: '/chart/:staffId',
            templateUrl: 'views/chart.html',
            controller: 'ChartCtrl',
            controllerAs: '$ctrl'
          })
          .state('slot', {
            url: '/slot',
            templateUrl: 'views/slot.html',
            controller: 'SlotCtrl',
            controllerAs: '$ctrl',
            resolve: {
              staffWorking: function (ApiService) {
                return ApiService.staffWorking().get().$promise;
              }
            }
          });

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/home');
    });
