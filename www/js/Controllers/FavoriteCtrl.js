app.controller('FavoriteCtrl',function($scope,$localStorage,$ionicScrollDelegate,$state) {

    $scope.events = [];

    $scope.renderEvent = function(event){
        $state.go('app.favorite',{event:angular.toJson(event)});
    };

    $scope.deleteEvent = function(index){
        $scope.events.splice(index,1);
        $localStorage.remove('my_events',index);
        $localStorage.remove('my_events_ids',index);
    };

    $scope.refresh = function(){
        $scope.events = [];
        $scope.loadEvents();
    };


    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop();
    };

    $scope.loadEvents = function(){
        var events = $localStorage.getObject('my_events').slice($scope.events.length,$scope.events.length+6);
        for (var i = 0; i < events.length; i++)
            $scope.events.push(JSON.parse(events[i]));
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
    };

});