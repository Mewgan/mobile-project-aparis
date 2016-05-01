app
    .factory('Favorite', function ($state, $localStorage) {

        var events = [];

        return {
            instance: function () {
                return this;
            },
            show: function (event) {
                $state.go('app.favorite', {event: angular.toJson(event)});
            },
            remove: function (index) {
                events.splice(index, 1);
                $localStorage.remove('my_events', index);
                $localStorage.remove('my_events_ids', index);
                return true;
            },
            all: function () {
                var all = $localStorage.getObject('my_events').slice(events.length, events.length + 6);
                for (var i = 0; i < all.length; i++) {
                    var event = JSON.parse(all[i]);
                    event.is_before = (moment(event.fields.date_start).isBefore(new Date())) ? true : false;
                    events.push(event);
                }
                return events;
            },
            count: function () {
                return events.length;
            },
            refresh: function () {
                events = [];
            },
            done: function (index) {
                var all = $localStorage.getObject('my_events');
                var event = JSON.parse(all[index]);
                event.done = (typeof event.done !== 'undefined' && event.done) ? false : true;
                all[index] = JSON.stringify(event);
                $localStorage.setObject('my_events', all);
            }
        }
    })
    .controller('FavoriteCtrl', function ($scope, $ionicScrollDelegate, Favorite) {

        // Favorite page

        $scope.favorite = Favorite.instance();

        $scope.refresh = function () {
            Favorite.refresh();
            $scope.loadEvents();
        };

        $scope.scrollTop = function () {
            $ionicScrollDelegate.scrollTop();
        };

        $scope.loadEvents = function () {
            Favorite.all();
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.refreshComplete');
        };

    });
