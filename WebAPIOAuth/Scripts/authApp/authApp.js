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
            request: function (config) {
                var token = localStorage.getItem("bearerToken");
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = token;
                }
                return config;
            }
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

        var accessToken = getQueryObject($location.hash()).access_token;
        if (accessToken !== undefined) {
            localStorage.setItem('bearerToken', 'Bearer ' + accessToken);
            getLocalLogin()
                .then(function () {
                    $location.hash('');
                    $location.path('/values');
                });
        };

        $scope.login = function (loginProvider) {
            setLoginProvider(loginProvider).
                then(function () {
                    window.location = localStorage.getItem("loginUrl")
                });
        }

        function getLocalLogin() {
            var userInfoUrl = '/api/Account/UserInfo';
            var registerUrl = '/api/Account/RegisterExternal';


            return $http.get(userInfoUrl).
                    success(function (userInfo) {
                        if (!userInfo.HasRegistered) {
                            return $http.post(registerUrl).
                                success(function () {
                                    window.location = localStorage.getItem("loginUrl");
                                })
                        };
                    });
        };

        function setLoginProvider(loginProvider) {
            var loginListUrl = '/api/Account/ExternalLogins?returnUrl=' +
                encodeURIComponent($location.absUrl()) + '&generateState=true';

            return $http.get(loginListUrl).
                success(function (loginProviders) {
                    for (var i = 0; i < loginProviders.length; i++) {
                        if (loginProviders[i].Name === loginProvider) {
                            localStorage.setItem("loginUrl", loginProviders[i].Url);
                            return;
                        }
                    }
                    // Error if code gets here
                });
        }

        function getQueryObject(queryString) {
            var queryObject = {};
            var params = queryString.split('&');
            for (var i = 0; i < params.length; i++) {
                var kvPair = params[i].split('=');
                queryObject[decodeURIComponent(kvPair[0])] =
                    decodeURIComponent(kvPair[1]);
            }
            return queryObject;
        };
    }
]);