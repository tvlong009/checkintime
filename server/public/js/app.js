var app = angular.module('app', [
  'ui.router',
  'ngMaterial',
  'ngMessages',
  'ngResource',
  'bw.paging',
  'ngMdIcons',
  'pascalprecht.translate',
  'ngSanitize',
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker',
  'ngCsv'
])
    .run(["$rootScope", "$window", function($rootScope, $window){
  $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams){
        $rootScope.currentState = toState.name;
        $rootScope.title = (toState.data && toState.data.pageTitle) ? toState.data.pageTitle : 'admin';
        document.title = $rootScope.title;
        $rootScope.goBack = function(){
          $window.history.back();
        }
      })
}])
    .directive("compareTo", [function(){
  return {
    require: "ngModel",
    scope: {
      otherModelValue: "=compareTo"
    },
    link: function(scope, element, attributes, ngModel) {

      ngModel.$validators.compareTo = function(modelValue) {
        return modelValue == scope.otherModelValue;
      };

      scope.$watch("otherModelValue", function() {
        ngModel.$validate();
      });
    }
  };
}])
    .factory('UtilService', function () {
      var services = {
        format: "YYYY-MM-DD"
      };

      services.parseDate = function (d) { return is.not.empty(d) ? moment(d).format(services.format) : undefined};

      services.today = moment().format(services.format);

      services.lastWeek = moment().subtract(1, 'week').format(services.format);

      return services;
    });
