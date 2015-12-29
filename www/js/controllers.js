angular.module('cyfclient.controllers', [])

  // AUTHENTICATION
  .controller('AuthCtrl', function($scope, $ionicConfig) {

  })

  // APP
  .controller('AppCtrl', function($scope, $ionicConfig) {

  })

  // LOGIN
  .controller('LoginCtrl', function($scope, $state) {
    $scope.doLogIn = function(){
      $state.go('app.overview');
    };

    $scope.user = {};

    $scope.user.email = "user@cyf.com";
    $scope.user.pin = "12345";

  })

  // SIGNUP
  .controller('SignupCtrl', function($scope, $state) {
    $scope.user = {};

    $scope.user.email = "user@cyf.com";

    $scope.doSignUp = function(){
      $state.go('app.overview');
    };
  })

  .controller('ForgotPasswordCtrl', function($scope, $state) {
    $scope.recoverPassword = function(){
      $state.go('app.overview');
    };

    $scope.user = {};
  })

  // OVERVIEW
  .controller('OverviewCtrl', function($scope, $http) {

  })

  // TOURS
  .controller('ToursCtrl', function($scope, $http) {

  })

  // ECO-SCORES
  .controller('ScoresCtrl', function($scope, $http) {

  })

  // ALERTS
  .controller('AlertsCtrl', function($scope, $http) {

  })

  // PROFILE
  .controller('ProfileCtrl', function($scope, $http) {

  })

  // SETTINGS
  .controller('SettingsCtrl', function($scope, $http) {

  })

  // INFO
  .controller('InfoCtrl', function($scope, $http) {

  })

;
