/**
 * Created by GUMI-QUANG on 4/29/16.
 */
app
    .factory("RestApi", ["$resource", function ($resource) {
      return {
        auth: function(){
          return $resource("/auth", {}, {
            update: {
              method: "PUT"
            }
          })
        },
        staff: function () {
          return $resource("/api/staff/:staffId", {staffId: "@staffId"}, {
            update: {
              method: "POST",
              url: "/api/staff/update-with-photo"
            }
          })
        },
        timeTracking: function () {
          return $resource("/api/time-tracking/:id", {id: "@id"}, {
            getTime: {
              method: "GET",
              url: "/api/time-tracking/getTime",
              isArray: false
            },
            update: {
              method: "PUT"
            },
            addTracking: {
              method: "POST",
              url: "/api/time-tracking/add-tracking"
            },
            updateTracking: {
              method: "POST",
              url: "/api/time-tracking/update-tracking"
            }
          })
        }
      }
    }]);
