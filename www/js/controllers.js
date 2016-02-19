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
  .controller('MenuCtrl', function($rootScope, $scope, UserService) {
    $scope.userId = localStorage.getItem("userId");
    $scope.avatar = localStorage.getItem("firstName");

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
        // Save userId and firstName to local storage
        localStorage.setItem("userId", $scope.user.name);

        UserService.userInfo($scope.user.name).then(function(user) {
          localStorage.setItem("firstName", user.name.first);
          if (!user.vin) {
            $state.go('auth.enroll');
          } else {
            $state.go('app.overview');
          }

        }, function(errMsg) {
          console.log(errMsg);
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
  .controller('EnrollCtrl', function($scope, $state, UserService, VehicleService, $ionicModal, $ionicPopup) {
    $scope.userId = localStorage.getItem("userId");

    $scope.user = {
      _id: $scope.userId,
      vin: ''
    };

    $scope.doEnroll = function() {

      $scope.vehicle = {
        vin: $scope.user.vin,
        userId: $scope.user._id
      }

      VehicleService.checkVin($scope.vehicle.vin).then(function(msg){

        var alertPopup = $ionicPopup.alert({
          title: 'VIN valid!',
          template: msg
        });

        VehicleService.createVehicle($scope.vehicle).then(function(msg) {
          console.log(msg);
        }, function(errMsg) {
          // error handling
        });

        UserService.updateUser($scope.user).then(function(user) {
          $state.go('app.overview');
        }, function(errMsg) {
          // error handling
        });

      }, function(errMsg) {
        var alertPopup = $ionicPopup.alert({
          title: 'VIN invalid!',
          template: errMsg
        });
      });
    };

    $ionicModal.fromTemplateUrl('modals/auth/enrollVehicle.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalEnroll = modal;

      $scope.vehicles = [];

      VehicleService.getVehiclesOfReadiConnect().then(function(data){
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
  .controller('ToursCtrl', function($scope, $filter, $ionicFilterBar, $ionicLoading, TourService, UserService) {
    $scope.userId = localStorage.getItem("userId");

    $scope.doRefresh = function() {
      $ionicLoading.show({
        template: 'Loading tours...'
      });

      UserService.userInfo($scope.userId).then(function(user) {
        TourService.getTours(user.vin)
          .then(function(data){
            $scope.tours = data;

            // Save number of total tours to local storage
            localStorage.setItem("toursCounter", data.length);

            /*

            $scope.dates = {};
            var date;

            for(var i = 0; i < $scope.tours.length; i++) {
              date = $filter('date')($scope.tours[i].route.timestampStart, "dd.MM.yyyy");

              if(!$scope.dates[date]) {
                $scope.dates[date] = [];
              }

              $scope.dates[date].push($scope.tours[i]);

            }
            */

            $scope.showFilterBar = function () {
              filterBarInstance = $ionicFilterBar.show({
                items: $scope.tours,
                update: function (filteredItems) {
                  $scope.tours = filteredItems;
                },
                filterProperties: ['userId']
              });
            };

          })
          .then(function(data){
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        });
      }, function(errMsg) {

      });

    };

    $scope.doRefresh();

  })

  // TOUR
  .controller('TourCtrl', function($scope, tour_data, MemberService, TourService, UserService, $ionicLoading, $ionicModal, $ionicPopover) {
    $scope.userId = localStorage.getItem("userId");
    $scope.assignee = '';

    $scope.geofenceAlerts = '';

    $scope.tour = tour_data;
    $ionicLoading.hide();

    $scope.route = [];

    $scope.checkGeofenceAlerts = function() {
      if ($scope.tour.geofenceAlerts) {
        $scope.geofenceAlerts = 1;
      } else {
        $scope.geofenceAlerts = 0;
      }
    };

    for (var i = 0; i < $scope.tour.route.drivenRoute.gpsLatitude.length; i++) {
      $scope.route.push({lat: parseFloat($scope.tour.route.drivenRoute.gpsLatitude[i]), lng: parseFloat($scope.tour.route.drivenRoute.gpsLongitude[i])});
    }

    $scope.getFamilyMembers = function() {
      UserService.userInfo($scope.userId).then(function(user) {
        $scope.vin = user.vin;

        MemberService.getMembers($scope.vin).then(function(data) {
          $scope.members = data;
        }, function(errMsg) {
          // error handling
        });

      }, function(errMsg) {

      });
    };

    $scope.doAssign = function() {
      $scope.tour.userId = $scope.assignee;

      TourService.updateTour($scope.tour).then(function(tour) {
        $scope.tour = tour;
        $scope.modalAssign.hide();
      }, function(errMsg) {
        // error handling
      });

    };

    $scope.$on("$stateChangeSuccess", function() {

      var startMarker = {
        lat: parseFloat($scope.tour.route.drivenRoute.gpsLatitude[0]),
        lng: parseFloat($scope.tour.route.drivenRoute.gpsLongitude[0]),
        focus: true,
        draggable: false};

      var endMarker = {
        lat: parseFloat($scope.tour.route.drivenRoute.gpsLatitude[$scope.tour.route.drivenRoute.gpsLatitude.length-1]),
        lng: parseFloat($scope.tour.route.drivenRoute.gpsLongitude[$scope.tour.route.drivenRoute.gpsLongitude.length-1]),
        focus: true,
        draggable: false};

      $scope.map = {
        center: {
          lat : parseFloat($scope.tour.route.drivenRoute.gpsLatitude[0]),
          lng : parseFloat($scope.tour.route.drivenRoute.gpsLongitude[0]),
          zoom : 14},
        markers: {
          startMarker: angular.copy(startMarker),
          endMarker: angular.copy(endMarker)}
      };

      $scope.paths = {
        route: {
          latlngs: [],
          color: '#0c60ee',
          weight: 10,
          clickable: false
        }
      };

      for (var i = 0; i < $scope.route.length; i++) {
        $scope.paths.route.latlngs.push($scope.route[i]);
      }

    });

    $ionicModal.fromTemplateUrl('modals/tour/showMap.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalMap = modal;
    });

    $ionicModal.fromTemplateUrl('modals/tour/showSpeed.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalSpeed = modal;

      var speedData = new Array();
      var speedLabel = new Array();
      var speedFence = new Array();

      for (var i = 0; i < $scope.tour.route.speed.length; i++) {
        speedData.push(parseInt($scope.tour.route.speed[i]));
        speedFence.push(parseInt(50));
        speedLabel.push('');
      }

      $scope.chartData = {
        labels: speedLabel,
        series: ['Speedfence', 'Speed'],
        data: [
          speedFence,
          speedData
        ],
        options: {
          pointDot : false,
          scaleShowHorizontalLines: true,
          scaleShowVerticalLines: false,
          scaleShowLabels: true,
          responsive: true
        },
        colours: [
          {
            fillColor: 'rgba(255, 255, 255, 0.0)',
            strokeColor: 'rgba(255, 76, 76, 0.5)',
          },
          {
            fillColor: 'rgba(56, 126, 245, 0.7)',
            strokeColor: 'rgba(12, 96, 238, 0.9)',
          }
        ]
      };

    });

    $ionicModal.fromTemplateUrl('modals/tour/assignTour.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalAssign = modal;

      $scope.updateAssignee = function(id) {
        $scope.assignee = id;
      };

    });

    $ionicPopover.fromTemplateUrl('popovers/tour/showEcoScore.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popoverScore = popover;
    });

  })

  // ECO-SCORES
  .controller('ScoresCtrl', function($scope) {

    $scope.chartData = {
      labels: ['November', 'Dezember', 'Januar'],
      series: ['Tobias', 'Felix'],
      data: [
        [92, 87, 90],
        [85, 86, 72]
      ],
      options: {
        pointDot : false,
        scaleShowHorizontalLines: true,
        scaleShowVerticalLines: false,
        scaleShowLabels: true,
        responsive: true
      },
      colours: [
        {
          fillColor: 'rgba(56, 126, 245, 0.7)',
          strokeColor: 'rgba(12, 96, 238, 0.9)',
        },
        {
          fillColor: 'rgba(56, 126, 245, 0.7)',
          strokeColor: 'rgba(12, 96, 238, 0.9)',
        }
      ]
    };

  })

  // ALERTS
  .controller('AlertsCtrl', function($scope, AlertService) {

    AlertService.getAlerts().then(function(data){
        $scope.alerts = data;

    }, function(errMsg) {
      // error handling
    });

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
        localStorage.setItem("firstName", user.name.first);
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

        // Save number of family members to local storage
        localStorage.setItem("familyCounter", data.length);

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
  .controller('FamilyMemberCtrl', function($rootScope, $scope, $state, $stateParams, geofence_data, UserService, GeoLocationService, GeofenceService, $ionicLoading, $ionicModal, $ionicPopover) {
    $scope.memberId = $stateParams.memberId;

    $scope.user = {
      _id: $scope.memberId
    };

    $scope.geofence = {};

    // set default geofence if empty
    if (geofence_data.geofence === null) {
      $scope.geofence.latitude = 48.764409799999996;
      $scope.geofence.longitude = 9.164410499999999;
      $scope.geofence.radius = 1000;
    } else {
      $scope.geofence = geofence_data.geofence;
    }

    UserService.userInfo($scope.memberId).then(function(user) {
      $scope.profile = user;
    }, function(errMsg) {
      // error handling
    });

    $scope.doUpdateMember = function() {
      // fill empty userinfo with previous data for updating
      if (!$scope.user.name.first) {
        $scope.user.name.first = $scope.profile.name.first;
      } else if (!$scope.user.name.last) {
        $scope.user.name.last = $scope.profile.name.last;
      }

      UserService.updateUser($scope.user).then(function(user) {
        localStorage.setItem("firstName", user.name.first);
        $scope.profile = user;
        $scope.modalMember.hide();
      }, function(errMsg) {
        // error handling
      });

    };

    $scope.getLocation = function () {
      $ionicLoading.show({
        template: 'Searching current location...'
      });
      GeoLocationService.getCurrentPosition()
        .then(function (position) {
          $ionicLoading.hide();

          // define new center with geolocation
          $scope.map.center.lat  = position.coords.latitude;
          $scope.map.center.lng = position.coords.longitude;
          $scope.map.center.zoom = 15;

          // define new marker with geolocation
          $scope.map.markers.mainMarker = {
            lat:position.coords.latitude,
            lng:position.coords.longitude,
            focus: true,
            draggable: true
          };

          // define new path with geolocation
          $scope.paths = {
            circle: {
              type: 'circle',
              radius: 500,
              latlngs: $scope.map.markers.mainMarker,
              color: '#0c60ee',
              weight: 4,
              fillColor: '#387ef5',
              fillOpacity: 0.3,
              clickable: false
            }
          };

        }, function (reason) {
          $ionicLoading.show({
            template: 'Cannot obtain current location',
            duration: 1000
          });
        });
    };

    $scope.doSetGeofence = function() {
      $scope.newGeofence = {
        latitude: $scope.map.markers.mainMarker.lat,
        longitude: $scope.map.markers.mainMarker.lng,
        radius: parseInt($scope.paths.circle.radius)
      };

      $scope.user.geofence = $scope.newGeofence;

      UserService.updateUser($scope.user).then(function(user) {
        $scope.profile = user;
        $scope.modalGeofence.hide();
      }, function(errMsg) {
        // error handling
      });

    };

    $scope.doSetSpeedfence = function() {
      UserService.updateUser($scope.user).then(function(user) {
        $scope.profile = user;
        $scope.modalSpeedfence.hide();
      }, function(errMsg) {
        // error handling
      });

    };

    $scope.$on("$stateChangeSuccess", function() {

      var mainMarker = {
        lat: parseFloat($scope.geofence.latitude),
        lng: parseFloat($scope.geofence.longitude),
        focus: true,
        draggable: true};

      $scope.map = {
        center: {
          lat : parseFloat($scope.geofence.latitude),
          lng : parseFloat($scope.geofence.longitude),
          zoom : 12},
        markers: {
          mainMarker: angular.copy(mainMarker)}
      };

      $scope.paths = {
        circle: {
          type: 'circle',
          radius: parseInt($scope.geofence.latitude),
          latlngs: mainMarker,
          color: '#0c60ee',
          weight: 4,
          fillColor: '#387ef5',
          fillOpacity: 0.3,
          clickable: false
        }
      };

    });

    // Update path when user drags marker
    $scope.$on('leafletDirectiveMarker.dragend', function(e, args) {
      $scope.paths = {
        circle: {
          type: 'circle',
          radius: $scope.paths.circle.radius,
          latlngs: args.leafletEvent.target._latlng,
          color: '#0c60ee',
          weight: 4,
          fillColor: '#387ef5',
          fillOpacity: 0.3,
          clickable: false
        }
      };
    });

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

      $scope.updateSpeedfence = function(sf) {
        $scope.user.speedfence = sf;
      };

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
  .controller('InfoCtrl', function($scope, API_ENDPOINT) {
    $scope.toursCounter = localStorage.getItem("toursCounter");
    $scope.familyCounter = localStorage.getItem("familyCounter");
    $scope.serverUrl = API_ENDPOINT.url;
  })

;
