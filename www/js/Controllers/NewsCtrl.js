app.controller('NewsCtrl',function($scope,$http,$ionicLoading,$ionicPopup,$state,$ionicScrollDelegate) {

    $scope.allNews = [];
    $scope.categories = [];
    $scope.cat = 0;
    $scope.api = "https://api.paris.fr/api/data/1.1/QueFaire/get_activities/?token=e247623179a81ec28644c1cf3dea16fbe3037ed078d0098f7490ce51da779ef6&created=0&offset="+$scope.allNews.length+"&limit=10";

    /* Methods */
    $scope.renderNews = function(news){
        $state.go('app.singleNews',{news:news});
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop();
    };

    $scope.changeCat = function(id){
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>'
        });
        if(id == 0){
            $scope.allNews = [];
            $scope.load();
        }else{
            $scope.allNews = [];
            $scope.api = "https://api.paris.fr/api/data/1.3/QueFaire/get_activities/?token=e247623179a81ec28644c1cf3dea16fbe3037ed078d0098f7490ce51da779ef6&cid="+id+"&created=0&start=0&end=0&offset="+$scope.allNews.length+"&limit=10";
            $scope.load();
        }
        $ionicLoading.hide();
    };

    $scope.load = function() {
        $http.get($scope.api).success(function (response) {
            if (response.status == 'success') {
                for (var i = 0; i < response.data.length; i++)
                    $scope.allNews.push(response.data[i]);
            }
        }).error(function () {
            $ionicPopup.alert({
                title: 'Erreur',
                template: 'Impossible de récupérer les informations !'
            });
        });
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    /* Run */
    $ionicLoading.show({
        template: '<ion-spinner></ion-spinner>'
    });
    $http.get("https://api.paris.fr/api/data/1.2/QueFaire/get_categories/?token=e247623179a81ec28644c1cf3dea16fbe3037ed078d0098f7490ce51da779ef6").success(function (response) {
        if (response.status == 'success') {
            for (var i = 0; i < response.data.length; i++)
                if(response.data[i].idparent == 0)
                    $scope.categories.push(response.data[i]);
        }
        $ionicLoading.hide();
    }).error(function () {
        $ionicLoading.hide();
        $ionicPopup.alert({
            title: 'Erreur',
            template: 'Impossible de récupérer les catégories !'
        });
    });

})
.controller('SingleNewsCtrl',function($scope,$stateParams,$http,$ionicLoading,$ionicPopup) {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>'
        });
        $http.get("https://api.paris.fr/api/data/1.5/QueFaire/get_activity/?token=e247623179a81ec28644c1cf3dea16fbe3037ed078d0098f7490ce51da779ef6&id="+$stateParams.news).success(function(response){
            $ionicLoading.hide();
            if (response.status == 'success')
                $scope.news = response.data[0];
            else {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: 'Impossible de récupérer les informations !'
                });
            }
        }).error(function(){
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Erreur',
                template: 'Impossible de récupérer les informations !'
            });
        });
        $ionicLoading.hide();
});