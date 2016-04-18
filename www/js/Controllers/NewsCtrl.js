app.controller('NewsCtrl',function($scope,$http,$ionicLoading,$ionicPopup) {

    $ionicLoading.show({
        template: '<ion-spinner></ion-spinner>'
    });
    $http.get("https://api.paris.fr/api/data/1.1/QueFaire/get_activities/?token=e247623179a81ec28644c1cf3dea16fbe3037ed078d0098f7490ce51da779ef6&created=0&offset=0&limit=10",{
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "application/json;charset=utf-8"
        }
    }).success(function(response){
        $ionicLoading.hide();
        if(response.status == 'success')
            $scope.news = response.data;
        else
            $ionicPopup.alert({
                title: 'Erreur',
                template: 'Impossible de récupérer les informations !'
            });
    }).error(function(){
        $ionicLoading.hide();
        $ionicPopup.alert({
            title: 'Erreur',
            template: 'Impossible de récupérer les informations !'
        });
    });


});