app.controller('HomeCtrl',function($scope,$state) {

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
});