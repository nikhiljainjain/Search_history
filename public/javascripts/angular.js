var app = angular.module('angular-app', ['ngRoute']);
var errorString = "Please check your internet connection Contact to owner";

app.controller('appController', function ($scope, $http) {
    $scope.searches() = () => {
        $scope.data.prefix = null;
        $scope.data.page = 0;
        $http.get("/users/serach/?", {params: $scope.data/*, page: 0, prefix: null*/})
        .then((res)=>{
           alert(res.data.data);//$scope.statusClient = res.data.data; 
        }, (response) => {
            $("#statusClient").attr("class","alert alert-danger");
            $scope.statusEmployee = errorString;
        });
    }

});