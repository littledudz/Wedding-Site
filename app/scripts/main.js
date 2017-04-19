angular.module('WebApp', ['ngRoute', 'ngResource'])

.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller:'HomeViewController',
      templateUrl:'snippets/views/home.html',
    })
    .otherwise({
      redirectTo:'/'
    });
});