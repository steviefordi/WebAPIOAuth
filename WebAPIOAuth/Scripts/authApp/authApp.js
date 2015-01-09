var app = angular.module('authApp', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/', {
            templateUrl: 'Scripts/authApp/home.html'
        }).
        when('/values', {
            templateUrl: 'Scripts/authApp/values.html',
            controller: 'valuesController'
        }).
        when('/login', {
            templateUrl: 'Scripts/authApp/login.html',
            controller: 'loginController'
        });

    $httpProvider.interceptors.push('authenticationInterceptor');
});

app.factory('authenticationInterceptor', ['$location', '$q',
    function ($location, $q) {
        return {
            responseError: function (rejection) {
                if (rejection.status === 401) {
                    $location.path('/login');
                }
                return $q.reject(rejection);
            },
        }
}]);

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

app.controller('loginController', ['$scope', '$location', '$http', '$q',
    function ($scope, $location, $http, $q) {

    }
]);