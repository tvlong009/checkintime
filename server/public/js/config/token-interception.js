app
    .config(["$provide", "$httpProvider", function ($provide, $httpProvider) {
      // Intercept http calls.
      $provide.factory('HttpInterceptor',
          function ($q, $injector) {
            return {
              // On request success
              request: function (config) {
                var token = localStorage.getItem("token");
                if (token != null) {
                  config.headers["x-access-token"] = token;
                }
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
                // Return the promise rejection
                if (rejection.status === 403) {
                  return $injector.get("$state").transitionTo("login");
                }

                return $q.reject(rejection);
              }
            };
          });

      // Add the interceptor to the $httpProvider.
      $httpProvider.interceptors.push('HttpInterceptor');

    }]);
