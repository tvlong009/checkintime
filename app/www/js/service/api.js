angular
    .module('app')
    .factory("ApiService", function($resource, CONSTANT) {
      return {
        staff: function () {
          return $resource(CONSTANT.apiUrl + "/api/staff/:staffId", {staffId: "@staffId"}, {
            update: {
              method: "POST",
              url: CONSTANT.apiUrl + "/api/staff/update-with-photo"
            },
            destroy: {
              method: "DELETE"
            }
          })
        },
        timeTracking: function () {
          // return $resource(CONSTANT.apiUrl + "/api/time-tracking", {}, {
          //   getTime: {
          //     method: "GET",
          //     url: CONSTANT.apiUrl + "/api/time-tracking/getTime",
          //     isArray: false
          //   },
          //   update: {
          //     method: "PUT"
          //   }
          // })
          return $resource( CONSTANT.apiUrl + "/api/time-tracking/:id", {id: "@id"}, {
            getTime: {
              method: "GET",
              url: CONSTANT.apiUrl + "/api/time-tracking/getTime",
              isArray: false
            },
            update: {
              method: "PUT"
            },
            addTracking: {
              method: "POST",
              url: CONSTANT.apiUrl + "/api/time-tracking/add-tracking"
            },
            updateTracking: {
              method: "POST",
              url: CONSTANT.apiUrl+  "/api/time-tracking/update-tracking"
            }
          })

        },
        staffWorking: function () {
          return $resource(CONSTANT.apiUrl + "/check-in")
        }
      }
    });
