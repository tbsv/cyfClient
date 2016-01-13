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

  })

  // APP
  .controller('MenuCtrl', function($scope, UserService) {
    $scope.userId = localStorage.getItem("userId");

    UserService.userInfo($scope.userId).then(function(user) {
      $scope.profile = user;
    }, function(errMsg) {

    });

  })

  // LOGIN
  .controller('LoginCtrl', function($scope, AuthService, UserService, $ionicPopup, $state) {

    $scope.user = {
      name: '',
      password: ''
    };

    $scope.doLogin = function() {
      AuthService.login($scope.user).then(function(msg) {
        // Save userId to local storage
        localStorage.setItem("userId", $scope.user.name);

        UserService.userInfo($scope.user.name).then(function(user) {
          if (!user.vin) {
            $state.go('auth.enroll');
          } else {
            $state.go('app.overview');
          }

        }, function(errMsg) {
          // error handling
        });

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

    $scope.master = true;

    /*
    $scope.checked = function (userRole) {
      if (userRole) {
        $scope.master = true;
      }
    };
    */

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

  // FORGOT PASSWORD
  .controller('ForgotPasswordCtrl', function($scope, $state) {
    $scope.recoverPassword = function(){
      $state.go('app.overview');
    };

    $scope.user = {};
  })

  // ENROLL VEHICLE
  .controller('EnrollCtrl', function($scope, $state, UserService, VehicleService, $ionicModal) {
    $scope.userId = localStorage.getItem("userId");

    $scope.user = {
      _id: $scope.userId,
      vin: ''
    };

    $scope.doEnroll = function() {
      UserService.updateUser($scope.user).then(function(user) {
        $state.go('app.overview');
      }, function(errMsg) {
        // error handling
      });
    };

    $ionicModal.fromTemplateUrl('modals/auth/enrollVehicle.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalEnroll = modal;

      $scope.vehicles = [];

      VehicleService.getVehicles().then(function(data){
        $scope.vehicles = data;
      }, function(errMsg) {
        // error handling
      });

      $scope.updateVehicle = function(vin) {
        $scope.user.vin = vin;
        $scope.modalEnroll.hide();
      };

    });

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
  .controller('ProfileCtrl', function($scope, $ionicPopover, $ionicModal, UserService, VehicleService) {
    $scope.userId = localStorage.getItem("userId");

    $scope.user = {
      _id: $scope.userId
    };

    UserService.userInfo($scope.userId).then(function(user) {
      $scope.profile = user;
      $scope.currentVehicle = $scope.profile.vin;
    }, function(errMsg) {
      // error handling
    });

    $scope.doUpdate = function() {
      // fill empty userinfo with previous data for updating
      if (!$scope.user.name.first) {
        $scope.user.name.first = $scope.profile.name.first;
      } else if (!$scope.user.name.last) {
        $scope.user.name.last = $scope.profile.name.last;
      }

      UserService.updateUser($scope.user).then(function(user) {
        $scope.profile = user;
        $scope.modalProfile.hide();
      }, function(errMsg) {
        // error handling
      });

    };

    $scope.doUpdateVehicle = function(vin) {
      // fill empty vin with previous data for updating
      if (!vin) {
        $scope.user.vin = $scope.profile.vin;
      } else {
        $scope.user.vin = vin;
      }

      UserService.updateUser($scope.user).then(function(user) {
        $scope.profile = user;
        $scope.modalVehicle.hide();
      }, function(errMsg) {
        // error handling
      });
    };

    $ionicPopover.fromTemplateUrl('popovers/app/profileMenu.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $ionicModal.fromTemplateUrl('modals/app/editProfile.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalProfile = modal;
    });

    $ionicModal.fromTemplateUrl('modals/app/changeVehicle.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalVehicle = modal;

      $scope.vehicles = [];

      VehicleService.getVehicles().then(function(data){
        $scope.vehicles = data;
      }, function(errMsg) {
        // error handling
      });

      $scope.updateVehicle = function(vin) {
        $scope.newVehicle = vin;
      };

    });

  })

  // FAMILY
  .controller('FamilyCtrl', function($scope, AuthService, MemberService, UserService, $ionicModal, $ionicPopup) {
    $scope.userId = localStorage.getItem("userId");

    $scope.user = {
      name: '',
      password: '',
      firstname: '',
      lastname: '',
      role: '',
      vin: ''
    };

    $scope.members = [];

    UserService.userInfo($scope.userId).then(function(user) {
      $scope.vin = user.vin;

      MemberService.getMembers($scope.vin).then(function(data) {
        $scope.members = data;
      }, function(errMsg) {
        // error handling
      });

    }, function(errMsg) {

    });


    $scope.doCreateMember = function() {

      $scope.user.password = "family";
      $scope.user.role = "child";
      $scope.user.vin = $scope.vin;

      AuthService.registerMember($scope.user).then(function(msg) {
        var alertPopup = $ionicPopup.alert({
          title: 'Signup success!',
          template: msg
        });
        $scope.modalMember.hide();
      }, function(errMsg) {
        var alertPopup = $ionicPopup.alert({
          title: 'Signup failed!',
          template: errMsg
        });
      });
    };

    $ionicModal.fromTemplateUrl('modals/app/newFamilyMember.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalMember = modal;
    });

  })

  // FAMILY MEMBER
  .controller('FamilyMemberCtrl', function($scope, $stateParams, UserService, $ionicModal, $ionicPopover) {
    $scope.memberId = $stateParams.memberId;

    $scope.user = {
      _id: $scope.memberId
    };

    UserService.userInfo($scope.memberId).then(function(user) {
      $scope.profile = user;
    }, function(errMsg) {
      // error handling
    });

    $scope.doUpdate = function() {
      // fill empty memberinfo with previous data for updating
      if (!$scope.user.name.first) {
        $scope.user.name.first = $scope.profile.name.first;
      } else if (!$scope.user.name.last) {
        $scope.user.name.last = $scope.profile.name.last;
      }

      UserService.updateUser($scope.user).then(function(user) {
        $scope.profile = user;
        $scope.modalMember.hide();
      }, function(errMsg) {
        // error handling
      });

    };

    $ionicPopover.fromTemplateUrl('popovers/family/memberMenu.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $ionicModal.fromTemplateUrl('modals/family/editMember.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalMember = modal;
    });

    $ionicModal.fromTemplateUrl('modals/family/setGeofence.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalGeofence = modal;
    });

    $ionicModal.fromTemplateUrl('modals/family/setSpeedfence.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalSpeedfence = modal;
    });

  })

  // SETTINGS
  .controller('SettingsCtrl', function($scope, AuthService, $ionicPopup, $ionicHistory, $state) {
    $scope.logout = function() {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Logout',
          template: 'Are you sure you want to logout?'
        });

        confirmPopup.then(function(res) {
          if(res) {
            AuthService.logout();
            $ionicHistory.clearCache().then(function(){
              $state.go('auth.check');
            })
          } else {

          }
        });
    };
  })

  // INFO
  .controller('InfoCtrl', function($scope, $http) {

  })

;
