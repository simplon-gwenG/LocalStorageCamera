angular.module('app.controllers', ['ionic','ngCordova'])

.controller('imageController', function($scope, $cordovaCamera, $cordovaFile) {
    // 1 tableau pour le ng-repeat pour stocker les images
    $scope.images = [];


    $scope.addImage = function() {
        // 2 options de tableau passé à cordova Camera
        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
        };

        // 3 appelle le module ngCordova que l'on a injecté au controller
        $cordovaCamera.getPicture(options).then(function(imageData) {

            // 4 qd l'image retourne des données on passe à la fonction SUCCESS qui appelle d'autres fonctions pour copier l'image originale dans le dossier de notre application
            onImageSuccess(imageData);

            function onImageSuccess(fileURI) {
                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
            }

            // 5 Cette fonction copie le fichier d'origine à notre répertoire app . Comme nous pourrions avoir à faire face à des images en double, nous donne un nouveau nom au fichier constitué d' une chaîne aléatoire et le nom original de l'image.
            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                    fileEntry.copyTo(
                        fileSystem2,
                        newName,
                        onCopySuccess,
                        fail
                    );
                },
                fail);
            }

            // 6 quand la copie est terminée avec succès on envoie l'url de l'image à notre tableau d'images. Ne pas oublier "appyl()" pour mettre à jour le tableau et la vue
            function onCopySuccess(entry) {
                $scope.$apply(function () {
                    $scope.images.push(entry.nativeURL);
                });
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i=0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

        }, function(err) {
            console.log(err);
        });
    }

    $scope.urlForImage = function(imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;
        return trueOrigin;
    }

});
