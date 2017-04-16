angular.module("WebApp", ['ngMeta'])

.config(function ($routeProvider, ngMetaProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'home.html',
    data: {
      meta: {
        'title': 'Home page',
        'description': 'This is the description shown in Google search results',
        'author': 'Dudley Edward Dickerson IV',
      }
    }
  })
  .when('/another-page', {
    templateUrl: 'another-page.html',
    data: {
      meta: {
        'title': 'Another page',
        'description': 'This is the description shown in Google search results',
        'author': 'Dudley Edward Dickerson IV',
      }
    }
  })
});