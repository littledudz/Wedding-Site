angular.module('WebApp', ['ngRoute', 'ngResource'])

.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller:'HomeViewController',
      templateUrl:'snippets/views/home.html',
    })
    .when('/about-the-couple', {
      controller:'AboutUsViewController',
      templateUrl:'snippets/views/about_us.html',
    })
    .when('/guest-list', {
      controller:'GuestListViewController',
      templateUrl:'snippets/views/guest_list.html',
    })
    .when('/information', {
      controller:'InformationViewController',
      templateUrl:'snippets/views/information.html',
    })
    .when('/engagement-photos', {
      controller:'PhotosViewController',
      templateUrl:'snippets/views/engagement_photos.html',
    })
    .when('/wedding-photos', {
      controller:'PhotosViewController',
      templateUrl:'snippets/views/wedding_photos.html',
    })
    .when('/registry', {
      controller:'RegistryViewController',
      templateUrl:'snippets/views/registry.html',
    })
    .otherwise({
      redirectTo:'/'
    });
});