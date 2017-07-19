app.controller("TrackingStaffCtrl",
    ["$scope", "$filter", "RestApi", "dialogServices", "$timeout", "socket", 'UtilService',
      function ($scope, $filter, RestApi, dialogServices, $timeout, socket, UtilService) {
        $scope.size = [];
        $scope.size.push("all");
        for(var z = 20; z < 400; z += 20){
          $scope.size.push(z);
        }


        $scope.timeTrackings = [];
        $scope.staffs = [];
        $scope.getArray = [];


        var getTimeTracking = function () {
          dialogServices.showLoadingDialog();
          
          //Force get end of day
          if(is.not.empty($scope.critical.dateEnd)){
            $scope.critical.dateEnd = new Date(moment($scope.critical.dateEnd).endOf("day").valueOf());
          }

          RestApi
              .timeTracking()
              .get($scope.critical)
              .$promise
              .then(function (result) {
                $scope.timeTrackings = [];
                $timeout(function () {
                  $scope.timeTrackings = result.data;
                  $scope.critical.total = result.total;
                  dialogServices.hide();
                  generateCsv($scope.timeTrackings);
                }, 0);
              })
              .catch(function (error) {
                $timeout(function () {
                  dialogServices.showAlertDialog("warning", error.data.message, "ok");
                }, 0);
              })
        };

        $scope.clear = function () {
          $scope.critical = {
            staffId: "",
            dateStart: "",
            dateEnd: "",
            type: "",
            limit: 20,
            total: 0,
            pageNumber: 1
          };
          getTimeTracking();
        };

        $scope.search = function () {
          getTimeTracking();
        };

        $scope.totalHours = function (t) {
          if (!t.dateOut) {
            return "N/A"
          } else {
            return moment(t.dateIn).preciseDiff(t.dateOut);
          }
        };


        $scope.csvHeader = [];
        function generateCsv(data) {
          if(data){
            $scope.getArray = [];

            if(is.object($scope.critical.dateStart) && is.object($scope.critical.dateEnd)){
              $scope.csvHeader = ["No.", "Name"];
              var staffIndex = 0;
              var formatDate = "YYYY-MM-DD";

              //Group data by staff name
              var groupStaff = _.groupBy(data, function(d){return d.staffId.name});

              var monthPerDay = [];

              //Pin day start and day end
              var dateStart = moment($scope.critical.dateStart);
              var dateEnd = moment($scope.critical.dateEnd);

              //Calculate total distance between days
              var distanceDays = dateEnd.diff(dateStart, "days") + 1;

              for(var d = 1; d <= distanceDays; d++){
                //Only get month/day
                var dM = dateStart.format(formatDate);

                monthPerDay.push(dM);
                $scope.csvHeader.push( "In - " + dM);
                $scope.csvHeader.push("Out - " + dM);

                //Move to next day
                dateStart.add(1, "day");
              }

              _.each(groupStaff, function(workingTimeOfStaff, name){
                var rowPerMoth = {
                  No: ++staffIndex,
                  name: name
                };

                _.each(monthPerDay, function(dm, i){
                  var workingDay = _.filter(workingTimeOfStaff, function(day){
                    return dm === UtilService.parseDate(day.dateIn);
                  });


                  if(workingDay.length > 0){
                    rowPerMoth["checkIn"+i] = $filter('date')(workingDay[0].dateIn, "hh:mm:ss a");
                    rowPerMoth["checkOut"+i] = $filter('date')(workingDay[0].dateOut, "hh:mm:ss a");

                    _.each(workingDay, function(wD,wI){
                      if(wI > 0){
                        rowPerMoth["checkIn"+i] += "/" + $filter('date')(wD.dateIn, "hh:mm:ss a");
                        rowPerMoth["checkOut"+i] += "/" + $filter('date')(wD.dateOut, "hh:mm:ss a");
                      }
                    });
                  }else{
                    rowPerMoth["checkIn"+i] = "";
                    rowPerMoth["checkOut"+i] = "";
                  }
                });

                $scope.getArray.push(angular.copy(rowPerMoth));

              });

            }else{
              $scope.csvHeader = ["No.", "Name", "Email", "Check In", "Check out", "Working time"];
              for(var i = 0, l = data.length; i < l; i++){
                var d = data[i];
                $scope.getArray.push({
                  no: i + 1,
                  name: d.staffId.name,
                  email: d.staffId.email,
                  checkIn: $filter('date')(d.dateIn, "yyyy/MM/dd hh:mm:ss a"),
                  checkOut: $filter('date')(d.dateOut, "yyyy/MM/dd hh:mm:ss a"),
                  workingTime: $scope.totalHours(d)
                });
              }
            }

          }
        }

        $scope.getByPage = function (pageNumber) {
          $scope.critical.pageNumber = pageNumber;
          getTimeTracking();
        };


        socket.on("response-check-in", function (data) {
          var staffId = data.staffId;
          for(var i = 0, l = $scope.staffs.length; i < l;i++){
            if($scope.staffs[i]._id == staffId){
              dialogServices.showNotificationToast($scope.staffs[i].name + " check in");
            }
          }
        });

        socket.on("response-check-out", function (data) {
          var staffId = data.staffId;
          for(var i = 0, l = $scope.staffs.length; i < l;i++){
            if($scope.staffs[i]._id == staffId){
              dialogServices.showNotificationToast($scope.staffs[i].name + " check out");
            }
          }
        });

        //Get staff list
        RestApi
            .staff()
            .get()
            .$promise
            .then(function (result) {
              $scope.staffs = result.data;
              $scope.clear();
            })
            .catch(function(error){
              $timeout(function () {
                dialogServices.showAlertDialog("warning", error.data.message, "ok");
              }, 0);
            });

      }]);
