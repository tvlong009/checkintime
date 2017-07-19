angular
    .module('app')
    .factory("CameraService", function ($cordovaCamera, $cordovaFileTransfer, $q, CONSTANT) {
      return {
        take: function () {
          var options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true,
            cameraDirection: Camera.Direction.FRONT
          };
          var defer = $q.defer();
          $cordovaCamera
              .getPicture(options)
              .then(function (imageData) {
            defer.resolve(imageData);
          }, function (error) {
            defer.reject(error);
          });
          return defer.promise;
        },
        send: function (urlServer, fileSource, formData, onProgress) {
          var defer = $q.defer();
          var options = new FileUploadOptions();
          options.headers = CONSTANT.token;
          options.fileKey = "file";
          options.params = formData;
          $cordovaFileTransfer.upload(urlServer, fileSource, options)
              .then(
                  defer.resolve,
                  defer.reject,
                  onProgress
              );

          return defer.promise;
        }
      }
    });
