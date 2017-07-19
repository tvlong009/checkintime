angular
    .module('app')
    .constant("CONSTANT", {
      //apiUrl: "http://192.168.1.251:8080",
      // apiUrl: "http://192.168.1.79:8080",
      apiUrl: "http://localhost:8080",
      token: {
        "x-access-token-mobile": "Hello! I am mobile"
      }
    });
