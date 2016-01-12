angular.module('cyfclient.controllers', [])

  // AUTHENTICATION
  .controller('AuthCtrl', function($scope, $ionicConfig) {

  })

  // APP
  .controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, UserService, AUTH_EVENTS) {
    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
      AuthService.logout();
      $state.go('app.check');
      var alertPopup = $ionicPopup.alert({
        title: 'Session Lost!',
        template: 'Sorry, You have to login again.'
      });
    });

    $scope.userId = localStorage.getItem("userId");

    UserService.userinfo($scope.userId).then(function(user) {
      $scope.profile = user;
    }, function(errMsg) {

    });

  })

  // APP
  .controller('MenuCtrl', function($scope, UserService) {
    $scope.userId = localStorage.getItem("userId");

    UserService.userinfo($scope.userId).then(function(user) {
      $scope.profile = user;
      console.log($scope.profile);
    }, function(errMsg) {

    });

  })

  // LOGIN
  .controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $state) {

    $scope.user = {
      name: '',
      password: ''
    };

    $scope.doLogin = function() {
      AuthService.login($scope.user).then(function(msg) {
        // Save userId to local storage
        localStorage.setItem("userId", $scope.user.name);
        $state.go('app.overview');
      }, function(errMsg) {
        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: errMsg
        });
      });
    };

  })

  // SIGNUP
  .controller('SignupCtrl', function($scope, AuthService, $ionicPopup, $state) {

    $scope.user = {
      name: '',
      password: '',
      firstname: '',
      lastname: '',
      role: ''
    };

    $scope.master = false;

    $scope.checked = function (userRole) {
      if (userRole) {
        $scope.master = true;
      }
    };

    $scope.doSignup = function() {
      if ($scope.master) {
        $scope.user.role = "master";
      } else {
      }
      AuthService.register($scope.user).then(function(msg) {
        $state.go('auth.login');
        var alertPopup = $ionicPopup.alert({
          title: 'Signup success!',
          template: msg
        });
      }, function(errMsg) {
        var alertPopup = $ionicPopup.alert({
          title: 'Signup failed!',
          template: errMsg
        });
      });
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
    $scope.chartData = {
      labels: ["January", "February", "March", "April", "May"],
      series: ['Foo', 'Baz', 'Bar'],
      data: [
        [65, 59, 63, 81, 56, 55, 68],
        [76, 77, 74, 72, 80, 72, 73],
        [42, 17, 28, 73, 50, 12, 68]
      ]
    };
  })

  // ALERTS
  .controller('AlertsCtrl', function($scope, $http) {

  })

  // PROFILE
  .controller('ProfileCtrl', function($scope, UserService) {
    $scope.userId = localStorage.getItem("userId");

    UserService.userinfo($scope.userId).then(function(user) {
      $scope.profile = user;
      console.log($scope.profile);
    }, function(errMsg) {

    });

    /*
    $scope.userinfo = function() {
      $scope.userId = localStorage.getItem("userId");
      console.log($scope.userId);

      UserService.userinfo($scope.userId).then(function(user) {
        $scope.profile = user;
        console.log($scope.profile);
      }, function(errMsg) {

      });

    };*/


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
  .controller('SettingsCtrl', function($scope, AuthService, $ionicPopup, $state) {
    $scope.logout = function() {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Logout',
          template: 'Are you sure you want to logout?'
        });

        confirmPopup.then(function(res) {
          if(res) {
            AuthService.logout();
            $state.go('auth.check');
          } else {

          }
        });
    };
  })

  // INFO
  .controller('InfoCtrl', function($scope, $http) {

  })

;
