var app = angular.module('WebApp', ['ngRoute', 'ngResource']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl:'snippets/home.html',
    controller:'HomeViewController'
  })
  .otherwise({
    redirectTo:'/'
  });
}]);