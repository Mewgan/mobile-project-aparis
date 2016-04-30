app.controller('EventsCtrl',function($scope,$http,$ionicLoading,$ionicPopup,$localStorage,$state,$ionicScrollDelegate) {

    $scope.events = [];
    /* Methods */
    $scope.renderEvent = function(event){
        $state.go('app.event',{event:angular.toJson(event)});
    };

    $scope.addToFavorite = function(event){
        $localStorage.addObject('my_events',event);
        $localStorage.add('my_events_ids',event.recordid);
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop();
    };

    $scope.refresh = function(){
        $scope.events = [];
        $scope.loadEvents();
    };

    $scope.loadEvents = function() {
        $http.get("http://opendata.paris.fr/api/records/1.0/search/?dataset=evenements-a-paris&facet=updated_at&facet=tags&facet=department&facet=region&facet=city&facet=date_start&facet=date_end&sort=updated_at&rows=6&start="+$scope.events.length)
            .success(function (response) {
                for (var i = 0; i < response.records.length; i++) {
                    var event = response.records[i];
                    event.favorite = false;
                    if(typeof $localStorage.get('my_events_ids') !== 'undefined')
                        event.favorite = $localStorage.get('my_events_ids').indexOf(response.records[i].recordid) >= 0;
                    $scope.events.push(event);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }).error(function () {
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: 'Impossible de récupérer les informations !'
                });
            }).finally(function() {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
    };
})
.controller('EventCtrl',function($scope,$stateParams,$cordovaSocialSharing,$ionicPopup) {

        $scope.event = angular.fromJson($stateParams.event);

        $scope.share = function(event){
            $cordovaSocialSharing
                .share(event.fields.description, event.fields.title, event.fields.image, event.fields.link) // Share via native share sheet
                .then(function(result) {
                    if(result.completed)
                        $ionicPopup.alert({
                            title: 'Information',
                            template: 'L\'événement a bien été partagé'
                        });
                    else
                        $ionicPopup.alert({
                            title: 'Information',
                            template: 'L\'événement n\'a pas été partagé'
                        })
                }, function(err) {
                    $ionicPopup.alert({
                        title: 'Le partage a échoué',
                        template: 'Réponse : '+err
                    })
                });
        };

        $scope.mapInitialize = function(lat,lng) {
            var myLatlng = new google.maps.LatLng(lat,lng);

            var mapOptions = {
                center: myLatlng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("carte"),
                mapOptions);


            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map
            });
        };

        google.maps.event.addDomListener(window, 'load', $scope.mapInitialize($scope.event.fields.latlon[0],$scope.event.fields.latlon[1]));
});