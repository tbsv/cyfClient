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
    $scope.labels = ["Gordon", "Barney", "Lizzy"];
    $scope.series = ['Series A', 'Series B'];
    $scope.piedata = [325, 148, 56];
    $scope.bardata = [325, 148, 56];
  })

  // TOURS
  .controller('ToursCtrl', function($scope, $ionicLoading, TourService) {

    $scope.tours = [];

    $scope.doRefresh = function() {
      $ionicLoading.show({
        template: 'Loading tours...'
      });

      TourService.getTours()
        .then(function(data){
          $scope.tours = data;
          $ionicLoading.hide();
        });
    };

    $scope.doRefresh();

  })

  // TOUR
  .controller('TourCtrl', function($scope, tour_data, $ionicLoading) {
    $scope.tour = tour_data;
    $ionicLoading.hide();
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

  // FAMILY
  .controller('FamilyCtrl', function($scope, $ionicModal) {
    $scope.members = [
      { firstName: 'Gordon', lastName: 'Freeman', type: 'Son' },
      { firstName: 'Barney', lastName: 'Harbour', type: 'Son' },
      { firstName: 'Lizzy', lastName: 'Lighthouse', type: 'Daughter' }
    ];

    $ionicModal.fromTemplateUrl('modals/app/newFamilyMember.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.addMember = function(u) {
      $scope.members.push({ firstName: u.firstName, lastName: u.lastName, type: u.type });
      $scope.modal.hide();
    };

    $scope.removeMember = function (index) {
      $scope.members.splice(index, 1);
    };
  })

  // SETTINGS
  .controller('SettingsCtrl', function($scope, $http) {

  })

  // INFO
  .controller('InfoCtrl', function($scope, $http) {

  })

;
