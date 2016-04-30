app
    .controller('IntroCtrl', function($scope, $state, $localStorage,$ionicSlideBoxDelegate) {

        // Called to navigate to the main app
        $scope.startApp = function() {
            $localStorage.set('logged',true);
            $state.go('app.home');
        };
        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };

        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
    })
;
