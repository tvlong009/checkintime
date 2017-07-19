angular
    .module('app')
    .factory("socketService", function(CONSTANT) {
      return io.connect(CONSTANT.apiUrl);
    });