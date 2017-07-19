/**
 * Created by ThanhQuangNgocTuong on 5/2/16.
 */
app.factory("socket", ["$location", function($location){
  var url = $location.protocol() + "://" + $location.host() + ":" + $location.port();
  return io.connect(url);
}]);
