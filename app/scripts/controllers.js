angular.module("WebApp")

.controller('HomeViewController', ['$scope' ,'$location', function ($scope, $location) {
    $scope.goToHomeView = function () { $location.path('/') };
    $scope.goToAboutUs = function () { $location.path('/about-us') }
}]);