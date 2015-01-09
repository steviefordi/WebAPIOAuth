var app = angular.module('authApp', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/', {
            templateUrl: 'Scripts/authApp/home.html'
        }).
        when('/values', {
            templateUrl: 'Scripts/authApp/values.html',
            controller: 'valuesController'
        });
});

app.controller('valuesController', ['$scope', '$http', function ($scope, $http) {
    $scope.errorGettingValues = false;
    $scope.errorCode = null;

    $http({
        url: '/api/Values',
        method: "GET"
    }).success(function (data) {
        $scope.values = data;
    }).error(function (data, status) {
        $scope.errorCode = status;
        $scope.errorGettingValues = true;
    });
}]);