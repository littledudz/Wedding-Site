angular.module("WebApp")

.controller('NavbarController', ['$scope', '$location', 'modals', function ($scope, $location) {
    $scope.goToHomeView = () => { $location.path('/') };
}])
.controller('HomeViewController', ['$scope' ,'$location', function ($scope) {
    
}])
.controller('AboutUsViewController', ['$scope' ,'$location', function ($scope) {
    
}])
.controller('GuestListViewController', ['$scope' ,'$location', function ($scope) {
    
}])
.controller('InformationViewController', ['$scope' ,'$location', function ($scope) {
    
}])
.controller('PhotosViewController', ['$scope' ,'$location', function ($scope) {
    
}])
.controller('RegistryViewController', ['$scope' ,'$location', function ($scope) {
    
}])
.controller('RSVPViewController', ['$scope' ,'$location', function ($scope) {
    
}])
.controller('FooterController', ['$scope', function ($scope) {
    
}]);