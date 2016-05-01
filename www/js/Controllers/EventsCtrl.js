app
    .factory('Event',function($state,$localStorage){

        var events = [];

        return {
            instance: function(){
                return this;
            },
            show: function(event){
                $state.go('app.event',{event:angular.toJson(event)});
            },
            addToFavorite: function(event){
                if(typeof $localStorage.get('my_events_ids') === 'undefined') {
                    $localStorage.addObject('my_events', event);
                    $localStorage.add('my_events_ids', event.recordid);
                }else {
                    var index = JSON.parse($localStorage.get('my_events_ids')).indexOf(event.recordid);
                    if (index >= 0) {
                        $localStorage.remove('my_events', index);
                        $localStorage.remove('my_events_ids', index);
                    } else {
                        $localStorage.addObject('my_events', event);
                        $localStorage.add('my_events_ids', event.recordid);
                    }
                }
            },
            refresh: function(){
                events = [];
            },
            set: function(event){
                events = event;
            },
            all: function(){
                return events;
            },
            count: function(){
                return events.length;
            }
        }
    })
    .controller('EventsCtrl',function($scope,$http,$ionicPopup,$ionicScrollDelegate,$localStorage,Event) {

        $scope.events = Event.instance();

        $scope.scrollTop = function() {
            $ionicScrollDelegate.scrollTop();
        };

        $scope.refresh = function(){
            Event.refresh();
            $scope.loadEvents();
        };

        $scope.loadEvents = function() {
            $http.get("http://opendata.paris.fr/api/records/1.0/search/?dataset=evenements-a-paris&facet=updated_at&facet=tags&facet=department&facet=region&facet=city&facet=date_start&facet=date_end&sort=updated_at&rows=6&start="+$scope.events.count())
                .success(function (response) {
                    var events = Event.all();
                    for (var i = 0; i < response.records.length; i++) {
                        var event = response.records[i];
                        event.favorite = false;
                        event.is_before = (moment(event.fields.date_start).isBefore(new Date()))?true:false;
                        if(typeof $localStorage.get('my_events_ids') !== 'undefined')
                            event.favorite = $localStorage.get('my_events_ids').indexOf(response.records[i].recordid) >= 0;
                        events.push(event);
                    }
                    Event.set(events);
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
    .controller('EventCtrl',function($scope,$stateParams,$cordovaSocialSharing,$cordovaLocalNotification,$ionicPopup) {

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

            $scope.remind = function(event) {
                $cordovaLocalNotification.isScheduled(event.recordid)
                    .then(function(isScheduled) {
                        if(isScheduled) {
                            $ionicPopup.alert({
                                title: 'Information',
                                template: 'Cette action a déjà été effectué'
                            });
                        }else{
                            var alarmTime = new Date(event.fields.date_start);
                            alarmTime.setDate(alarmTime.getDate() - 1);
                            $cordovaLocalNotification.add({
                                id: event.recordid,
                                date: alarmTime,
                                message: event.fields.placename,
                                title: event.fields.title,
                                autoCancel: true,
                                sound: null
                            }).then(function () {
                                $ionicPopup.alert({
                                    title: 'Information',
                                    template: 'Vous serez prévenu 1 jour avant l\'événement'
                                });
                            });
                        }
                    });
            };

            $scope.isScheduled = function() {
                $cordovaLocalNotification.isScheduled("1234").then(function(isScheduled) {
                    alert("Notification 1234 Scheduled: " + isScheduled);
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