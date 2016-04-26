app.controller('EventsCtrl',function($scope,$http,$ionicLoading,$ionicPopup,$state,$ionicScrollDelegate) {

    $scope.events = [];

    /* Methods */
    $scope.renderEvent = function(event){
        $state.go('app.event',{event:angular.toJson(event)});
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop();
    };

    $scope.refresh = function(){
        $scope.events = [];
        $scope.load();
    };
    $scope.load = function() {
        $http.get("http://opendata.paris.fr/api/records/1.0/search/?dataset=evenements-a-paris&facet=updated_at&facet=tags&facet=department&facet=region&facet=city&facet=date_start&facet=date_end&start="+$scope.events.length)
            .success(function (response) {
                for (var i = 0; i < response.records.length; i++)
                    $scope.events.push(response.records[i]);
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
    $scope.$on('$stateChangeSuccess', function() {
        $scope.load();
    });

})
.controller('EventCtrl',function($scope,$stateParams) {
        $scope.event = angular.fromJson($stateParams.event);
});