app.
    controller('HomeCtrl',function($scope,$state) {

        $scope.locate = function(){
            $state.go('app.search-around-me');
        };

    })
    .controller('GeoCtrl',function($scope,$ionicScrollDelegate,$ionicLoading,$state,$ionicPlatform,$http,$cordovaGeolocation,$geoLocation){

            $scope.events = [];

            $scope.loading = true;

            $scope.renderEvent = function(event){
                $state.go('app.event',{event:angular.toJson(event)});
            };

            $scope.scrollTop = function() {
                $ionicScrollDelegate.scrollTop();
            };

            $scope.load = function() {
                var options = {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                };
                $ionicPlatform.ready(function () {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var url = "http://opendata.paris.fr/api/records/1.0/search/?dataset=evenements-a-paris&facet=updated_at&facet=tags&facet=department&facet=region&facet=city&facet=date_start&facet=date_end&start=" + $scope.events.length + "&geofilter.distance=" + position.coords.latitude + "," + position.coords.longitude + ",5000";
                        $http.get(url).success(function (response) {
                            $geoLocation.setGeolocation(position.coords.latitude, position.coords.longitude);
                            if(response.records.length != 10)$scope.loading= false;
                            for (var i = 0; i < response.records.length; i++)
                                $scope.events.push(response.records[i]);
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        }).error(function () {
                            $ionicPopup.alert({
                                title: 'Erreur',
                                template: 'Impossible de récupérer les informations !'
                            }).then(function () {
                                $state.go('app.home');
                            });
                        });
                    }, function () {
                        $ionicPopup.alert({
                            title: 'Erreur',
                            template: 'Oops :( Problème technique !'
                        }).then(function () {
                            $state.go('app.home');
                        })
                    }, options);
                });
            }
    })
    .controller('MapCtrl',function($scope,$geoLocation,$ionicPlatform){
        $ionicPlatform.ready(function () {
            var latlng = new google.maps.LatLng($geoLocation.setGeolocation.lat,$geoLocation.setGeolocation.lng);
            //objet contenant des propriétés avec des identificateurs prédéfinis dans Google Maps permettant
            //de définir des options d'affichage de notre carte
            var options = {
                center: latlng,
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            //constructeur de la carte qui prend en paramêtre le conteneur HTML
            //dans lequel la carte doit s'afficher et les options
            var carte = new google.maps.Map(document.getElementById("carte"), options);

            var marqueur = new google.maps.Marker({
                position: latlng,
                map: carte
            });

            var cityCircle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: carte,
                center: latlng,
                radius: 5000
            });
        });

    });