angular.module('app',
    [
      'ionic',
      'ngAnimate',
      'ngMessages',
      'ngAria',
      'ngResource',
      'pascalprecht.translate',
      'ngCordova',
      'ngMaterial',
      'chart.js'
    ])
    .run(function ($ionicPlatform, $rootScope, CONSTANT) {
      $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
        $rootScope.apiUrl = CONSTANT.apiUrl;
        $ionicPlatform.on("resume", function () {
          $rootScope.$broadcast("fetch-data");
        });
      });
    })
    .config(function ($ionicConfigProvider, $mdGestureProvider) {
      $ionicConfigProvider.navBar.alignTitle('center');
      $ionicConfigProvider.views.transition('ios');
      $ionicConfigProvider.backButton.icon('ion-ios-arrow-left').previousTitleText(false);
      $mdGestureProvider.skipClickHijack();
      $ionicConfigProvider.views.maxCache(5);
    })
    .config(function ($provide, $httpProvider) {
      // Intercept http calls.
      $provide.factory('HttpInterceptor',
          function ($q) {
            return {
              // On request success
              request: function (config) {
                config.headers["x-access-token-mobile"] = "Hello! I am mobile";
                return config || $q.when(config);
              },

              // On request failure
              requestError: function (rejection) {
                // Return the promise rejection.
                return $q.reject(rejection);
              },

              // On response success
              response: function (response) {
                // Return the response or promise.
                return response || $q.when(response);
              },

              // On response failture
              responseError: function (rejection) {
                return $q.reject(rejection);
              }
            };
          });

      // Add the interceptor to the $httpProvider.
      $httpProvider.interceptors.push('HttpInterceptor');
    })
  .factory('UtilService', function () {
    var services = {
      format: "YYYY-MM-DD"
    };

    services.parseDate = function (d) { return is.not.empty(d) ? moment(d).format(services.format) : undefined};

    services.today = moment().format(services.format);

    services.lastWeek = moment().subtract(1, 'week').format(services.format);

    return services;
  })
  .config(function($mdDateLocaleProvider, ChartJsProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
      return moment(date).format("YYYY-MM-DD");
    };
    ChartJsProvider.setOptions({ colors : [ '#45b7cd', '#ff6384'] });
  })
  .factory('FactoryService', function () {
    return {
      staff: null
    };
  })
  .factory('ChartService', function (UtilService, ApiService) {
    var service = {};

    service.statusReturn = function (number) {
      var textStatus = "";
      var numberS = Math.floor(number);
      var numberE = Math.ceil(number);
      var textS = service.textStatusReturn(numberS);
      var textE = service.textStatusReturn(numberE);

      if(textS === textE){
        textStatus = number + " = " + textS;
      }else {
        textStatus = textS + " < " + number + " < " + textE;
      }
      return textStatus;
    };

    service.textStatusReturn = function (status) {
      var text;
      switch(status){
        case  2:
          text = "Upset";
          break;
        case 3:
          text = "Normal";
          break;
        case 4:
          text = "Happy";
          break;
        case 5:
          text = "Very Happy";
          break;
        default:
          text = "Very Upset";
          break;
      }
      return text;
    };

    service.loadChart = function (critical) {
      return new Promise(function (resolve, reject) {
       var dataService = {
          series:[[],[]],
         dateTimes:[],
         histories:[],
         averageCheckIn: 0,
         checkInStatus: [],
         averageCheckOut: 0,
         checkOutStatus:[]
       };

        ApiService
          .timeTracking()
          .get(critical)
          .$promise
          .then(function (res) {
            dataService.histories = res.data;

            if(dataService.histories.length > 0){
              _.each(_.reverse(dataService.histories), function (one) {
                var checkDate = UtilService.parseDate(one.updatedAt);
                dataService.series[0].push(one.motivationCheckIn);
                dataService.series[1].push(one.motivationCheckOut);
                dataService.dateTimes.push(checkDate);

              });
              // Set Status
              dataService.averageCheckIn = _.meanBy(dataService.series[0]).toFixed(2);
              dataService.checkInStatus = service.statusReturn(dataService.averageCheckIn);

              dataService.averageCheckOut = _.meanBy(dataService.series[1]).toFixed(2);
              dataService.checkOutStatus = service.statusReturn(dataService.averageCheckOut);

            }else {
              // Push Zero if have nothing
              dataService.series[0].push(0);
              dataService.series[1].push(0);
              dataService.dateTimes.push(0);
            }
            resolve(dataService);
          })
          .catch(reject);
      });
    };

    return service;
  });
