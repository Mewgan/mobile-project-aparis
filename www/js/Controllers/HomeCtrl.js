app.
    controller('MainCtrl', function ($scope, $ionicSideMenuDelegate) {
        // hamburger menu function
        $scope.toggleLeftSideMenu = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };
    })
    .controller('HomeCtrl', function ($scope, $state, $ionicPopup,$localStorage,$ionicScrollDelegate) {

        $scope.renderEvent = function (event) {
          $state.go('app.single', {event: angular.toJson(event)});
        };

        $scope.addToFavorite = function (event) {
          $localStorage.addObject('my_events', event);
          $localStorage.add('my_events_ids', event.recordid);
        };

        $scope.scrollTop = function () {
          $ionicScrollDelegate.scrollTop();
        };

        $scope.locate = function () {
            $state.go('app.search-around-me', {query: '', radius: 2000, date: ''});
        };

        $scope.search = function (query, radius, date) {
            if (typeof query === 'undefined' && typeof radius === 'undefined' && typeof date === 'undefined')
                $ionicPopup.alert({
                    title: 'Information',
                    template: 'Veuillez renseigner au moins un champ'
                });
            else {
                if (typeof radius !== 'undefined')
                    $state.go('app.search-around-me', {query: query, radius: radius, date: date});
                else
                    $state.go('app.search-query', {query: query, date: date});
            }
        };

    })
    .controller('SearchCtrl', function ($http, $scope, $ionicLoading, $state, $stateParams, $ionicPopup, $localStorage) {

        $scope.results = [];

        $scope.loading = true;

        $scope.isNothing = 1;

        $scope.map = false;

        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>'
        });
        var uri = "";
        var isQuery = false;
        if ($stateParams.query !== '') {
            uri += $stateParams.query;
            isQuery = true;
        }
        if ($stateParams.date !== '')
            if (isQuery)
                uri += " AND date_start >=" + moment($stateParams.date).format('DD/MM/YYYY');
            else
                uri += "date_start >=" + moment($stateParams.date).format('DD/MM/YYYY');

        $scope.load = function () {
            $http.get("http://opendata.paris.fr/api/records/1.0/search/?dataset=evenements-a-paris&facet=updated_at&facet=tags&facet=department&facet=region&facet=city&facet=date_start&facet=date_end&sort=updated_at&rows=6&start=" + $scope.results.length + "&q=" + uri)
                .success(function (response) {
                    $ionicLoading.hide();
                    $scope.isNothing = response.records.length;
                    if (response.records.length != 6)$scope.loading = false;
                    for (var i = 0; i < response.records.length; i++) {
                        var event = response.records[i];
                        event.favorite = false;
                        event.is_before = (moment(event.fields.date_start).isBefore(new Date())) ? true : false;
                        if (typeof $localStorage.get('my_events_ids') !== 'undefined')
                            event.favorite = $localStorage.get('my_events_ids').indexOf(response.records[i].recordid) >= 0;
                        $scope.results.push(event);
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }).error(function () {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Erreur',
                        template: 'Impossible de récupérer les informations !'
                    });
                }).finally(function () {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };
    })
    .controller('GeoCtrl', function ($scope, $ionicLoading, $localStorage, $state, $ionicPlatform, $http, $cordovaGeolocation, $stateParams, $ionicPopup) {

        $scope.results = [];

        $scope.loading = true;

        $scope.map = true;

        $scope.isNothing = 1;

        // map initialization with position marker and radius
        $scope.initialize = function (lat, lng) {
            var myLatlng = new google.maps.LatLng(lat, lng);
            var mapOptions = {
                center: myLatlng,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("carte"), mapOptions);
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map
            });
            var cityCircle = new google.maps.Circle({
                strokeColor: '#55D5DF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#55D5DF',
                fillOpacity: 0.35,
                map: map,
                center: myLatlng,
                radius: parseInt($stateParams.radius)
            });
        };

        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>'
        });

        $scope.load = function () {
            var options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };
            var date = moment().format('DD/MM/YYYY');
            var query = '';
            if (typeof $stateParams.date !== '' && $stateParams.date !== '')
                date = moment($stateParams.date).format('DD/MM/YYYY');
            if (typeof $stateParams.query !== 'undefined' && $stateParams.query !== '')
                query = $stateParams.query + " AND ";
            $ionicPlatform.ready(function () {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var url = "http://opendata.paris.fr/api/records/1.0/search/?dataset=evenements-a-paris&facet=updated_at&facet=tags&facet=department&facet=region&facet=city&facet=date_start&sort=updated_at&facet=date_end&rows=6&start=" + $scope.results.length + "&geofilter.distance=" + position.coords.latitude + "," + position.coords.longitude + "," + $stateParams.radius + "&q=" + query + "date_start >=" + date;
                    $http.get(url).success(function (response) {
                        $ionicLoading.hide();
                        $scope.isNothing = response.records.length;
                        // load map
                        google.maps.event.addDomListener(window, 'load', $scope.initialize(position.coords.latitude, position.coords.longitude));
                        if (response.records.length != 6)$scope.loading = false;
                        for (var i = 0; i < response.records.length; i++) {
                            var event = response.records[i];
                            event.favorite = false;
                            event.is_before = (moment(event.fields.date_start).isBefore(new Date())) ? true : false;
                            if (typeof $localStorage.get('my_events_ids') !== 'undefined')
                                event.favorite = $localStorage.get('my_events_ids').indexOf(response.records[i].recordid) >= 0;
                            $scope.results.push(event);
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }).error(function () {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Erreur',
                            template: 'Impossible de récupérer les informations !'
                        }).then(function () {
                            $state.go('app.home');
                        });
                    });
                }, function () {
                    $ionicLoading.hide();
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
;
