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
  .controller('MenuCtrl', function($rootScope, $scope, AlertService, UserService, $ionicHistory, $ionicSideMenuDelegate) {

    $scope.doRefresh = function() {

      $scope.userId = localStorage.getItem("userId");
      $scope.avatar = localStorage.getItem("firstName");
      $scope.greeting = localStorage.getItem("firstName");
      $scope.licenceNumber = localStorage.getItem("licenceNumber");
      $scope.role = localStorage.getItem("role").charAt(0).toUpperCase();
      $scope.geofenceActive = localStorage.getItem("geofenceActive");
      $scope.speedfenceActive = localStorage.getItem("speedfenceActive");

      UserService.userInfo($scope.userId).then(function (user) {
        $scope.profile = user;
        localStorage.setItem("geofenceActive", user.geofenceActive);
        localStorage.setItem("speedfenceActive", user.speedfenceActive);
      }, function (errMsg) {

      });

      AlertService.getAlerts(localStorage.getItem("vehicleId")).then(function (data) {
        $scope.alerts = data;
        $scope.alertCounter = 0;
        localStorage.setItem("alertsCounter", $scope.alertCounter);

        for (var i = 0; i < data.length; i++) {

          if (localStorage.getItem("role") == 'master' && data[i].readStatusMaster == false) {
            $scope.alertCounter++;
            localStorage.setItem("alertsCounter", $scope.alertCounter);
          } else if (localStorage.getItem("role") == 'child' && $scope.alerts[i].userId == localStorage.getItem("userId") && $scope.alerts[i].readStatusChild == false) {
            $scope.alertCounter++;
            localStorage.setItem("alertsCounter", $scope.alertCounter);
          }

        };
      }, function (errMsg) {
        // error handling
      }).then(function(){
        $scope.alertsNotifier = localStorage.getItem("alertsCounter");
        $scope.$broadcast('scroll.refreshComplete');
      });

    };

    $scope.doRefresh();

    // Reload side menu when it's opened
    $scope.$watch(function () {
        return $ionicSideMenuDelegate.getOpenRatio();
      },
      function (ratio) {
        if (ratio == 1){
          $scope.doRefresh();
        }
      });

  })

  // LOGIN
  .controller('LoginCtrl', function($scope, AuthService, UserService, VehicleService, $ionicPopup, $state, API_ENDPOINT) {

    $scope.user = {
      name: '',
      password: ''
    };

    $scope.serverEndpoint = API_ENDPOINT.url;

    $scope.doLogin = function() {
      AuthService.login($scope.user).then(function(msg) {

        UserService.userInfo($scope.user.name).then(function(user) {
          // Save userId, vin, firstName, rol and fences to local storage
          localStorage.setItem("userId", $scope.user.name);
          localStorage.setItem("firstName", user.name.first);
          localStorage.setItem("role", user.role);
          localStorage.setItem("vehicleId", user.vin);
          localStorage.setItem("geofenceActive", user.geofenceActive);
          localStorage.setItem("speedfenceActive", user.speedfenceActive);
          localStorage.setItem("termsOfUseAgreed", user.termsOfUseAgreed);

          if (user.termsOfUseAgreed == false) {
            $state.go('auth.termsOfUse');
          } else {
            if (!user.vin) {
              $state.go('auth.enroll');
            } else {
              // Save vehicleId and licence number
              localStorage.setItem("vehicleId", user.vin);
              VehicleService.getVehicle(user.vin).then(function (vehicle) {
                localStorage.setItem("licenceNumber", vehicle.licenceNumber);
              }, function (errMsg) {
                // error handling
              });

              // Send required tags to push service
              if (!$scope.serverEndpoint.indexOf('localhost')) {
              window.plugins.OneSignal.sendTags({role: user.role, userId: user._id});
              }

              $state.go('app.overview');
            }
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

  // TERMS OF USE AGREEMENT
  .controller('TermsOfUseCtrl', function($scope, $state, AuthService, UserService, $ionicHistory, $window) {
    $scope.userId = localStorage.getItem("userId");

    $scope.user = {
        _id: $scope.userId,
        termsOfUseAgreed: false
      };
    //User agreed Terms Of Use
    $scope.agreeTermsOfUse = function() {
      console.log("UoT Agreed");
      $scope.user.termsOfUseAgreed = true;
      localStorage.setItem("termsOfUseAgreed", true);
      UserService.updateUser($scope.user);

      if (localStorage.getItem("vehicleId")=="undefined"){
          $state.go('auth.enroll');

        } else {
          $state.go('app.overview');
        }

      }

    //User disagreed Terms Of Use
    $scope.disagreeTermsOfUse= function() {
      console.log("UoT Disagreed");
      $scope.user.termsOfUseAgreed = false;
      localStorage.setItem("termsOfUseAgreed", false);
      UserService.updateUser($scope.user);
      AuthService.logout();
      $window.localStorage.clear();
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache().then(function() {
        $state.go('auth.check');
      })
    }


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
      vin: '',
      licenceNumber: ''
    };

    $scope.doEnroll = function() {

      $scope.vehicle = {
        vin: $scope.user.vin,
        userId: $scope.user._id,
        licenceNumber: $scope.user.licenceNumber
      };

      VehicleService.checkVin($scope.vehicle.vin).then(function(msg){

        var regexpGermanLicenseNumber = new RegExp('^[A-Z]{1,3}-[A-Z]{1,2} [0-9]{1,4}$');

        if(!$scope.user.licenceNumber.toString().match(regexpGermanLicenseNumber)) {
          var alertPopup = $ionicPopup.alert({
            title: 'Licence number invalid! ',
            template: 'License number must match with e.g. HH-Z 2016'
          });
        } else {
          localStorage.setItem("licenceNumber", $scope.vehicle.licenceNumber);
          localStorage.setItem("vehicleId", $scope.vehicle.vin);

          VehicleService.createVehicle($scope.vehicle).then(function(msg) {

            var alertPopup = $ionicPopup.alert({
              title: 'VIN enrolled!',
              template: msg
            });

            UserService.updateUser($scope.user).then(function(user) {
              $state.go('app.overview');
            }, function(errMsg) {
              // error handling
            });

          }, function(errMsg) {
            // error handling
            var alertPopup = $ionicPopup.alert({
              title: 'VIN in use!',
              template: errMsg
            });
          });

        }
      }, function(errMsg) {
        var alertPopup = $ionicPopup.alert({
          title: 'VIN invalid!',
          template: errMsg + ' Or VIN does not match the typical structure.'
        });
      });



    };

    $ionicModal.fromTemplateUrl('modals/auth/enrollVehicle.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalEnroll = modal;

      $scope.vehicles = [];
      $scope.validVehicles = ["WDD1179421N250123", "WDD1179121N355937","WDD2122061B140828"];

      VehicleService.getVehiclesOfReadiConnect().then(function(data){
        $scope.vehicles = data;

        VehicleService.getVehicles().then(function(enrolled){
          $scope.enrolledVehicles = JSON.stringify(enrolled);

          $scope.checkEnrolledVehicles = function (vin) {
            if ($scope.enrolledVehicles.indexOf(vin) > -1) {
              return true;
            }
            else {
              return false;
            }
          };

          $scope.checkVehicleStatus = function (vin) {
            if ($scope.enrolledVehicles.indexOf(vin) > -1) {
              return 'icon ion-ios-people';
            }
            else if ($scope.validVehicles.indexOf(vin) > -1) {
              return 'icon ion-ios-checkmark-outline balanced';
            }
            else {
              return 'icon ion-ios-close-outline assertive';
            }
          };

        }, function(errMsg) {
          // error handling
        });

        $scope.checkValidVehicles = function (vin) {
          if ($scope.validVehicles.indexOf(vin) > -1) {
            return true;
          }
          else {
            return false;
          }
        };

      }, function(errMsg) {
        // error handling
      });

      $scope.updateVehicle = function(vin) {
        $scope.user.vin = vin;
        $scope.modalEnroll.hide();
      };

    });

  })

  /*
  // OVERVIEW
  .controller('OverviewCtrl', function($scope) {
    $scope.labels = ["Gordon", "Barney", "Lizzy"];
    $scope.series = ['Series A', 'Series B'];
    $scope.piedata = [325, 148, 56];
    $scope.bardata = [325, 148, 56];
  })

  // OVERVIEW WEEKLY
  .controller('OverviewWeeklyCtrl', function($scope, $location, $ionicNavBarDelegate) {
    $scope.labels = ["Gordon", "Barney", "Lizzy"];
    $scope.series = ['Series A', 'Series B'];
    $scope.piedata = [120, 60, 256];
    $scope.bardata = [120, 60, 256];

    var path = $location.path();
    if (path.indexOf('weekly') != -1)
      $ionicNavBarDelegate.showBackButton(false);
    else
      $ionicNavBarDelegate.showBackButton(true);
  })

  // OVERVIEW MONTHLY
  .controller('OverviewMonthlyCtrl', function($scope, $location, $ionicNavBarDelegate) {
    $scope.labels = ["Gordon", "Barney", "Lizzy"];
    $scope.series = ['Series A', 'Series B'];
    $scope.piedata = [180, 24, 340];
    $scope.bardata = [180, 24, 340];

    var path = $location.path();
    if (path.indexOf('monthly') != -1)
      $ionicNavBarDelegate.showBackButton(false);
    else
      $ionicNavBarDelegate.showBackButton(true);
  })
  */

  // TOURS
  .controller('ToursCtrl', function($scope, $filter, $ionicFilterBar, $ionicHistory, TourService, UserService) {
    $scope.userId = localStorage.getItem("userId");

    $scope.limit = 10;

    $scope.doRefresh = function() {

      UserService.userInfo($scope.userId).then(function(user) {
        TourService.getTours(user.vin)
          .then(function(data){
            $scope.tours = data;

            // Save number of total tours to local storage
            localStorage.setItem("toursCounter", data.length);

            $scope.showFilterBar = function () {
              filterBarInstance = $ionicFilterBar.show({
                items: $scope.tours,
                update: function (filteredItems) {
                  $scope.tours = filteredItems;
                },
                expression: function (filterText, value) {
                  return value.userId.indexOf(filterText) !== -1 || value.route.timestampStart.indexOf(filterText) !== -1
                }
              });
            };

          })
          .then(function(){
            $scope.$broadcast('scroll.refreshComplete');
        });
      }, function(errMsg) {

      });

    };

    $scope.doRefresh();

    $scope.moreDataCanBeLoaded = function(){
      if ($scope.limit > localStorage.getItem("toursCounter")) {
        return false;
      } else {
        return true;
      }
    };

    $scope.loadMoreData = function() {
      $scope.limit = $scope.limit+5;
      $scope.$broadcast('scroll.infiniteScrollComplete');

    };

    $scope.$on('$ionicView.enter', function() {
      $scope.doRefresh();
    });

  })

  // TOUR
  .controller('TourCtrl', function($scope, tour_data, MemberService, TourService, UserService, $ionicModal, $ionicPopover, $window) {
    $scope.userId = localStorage.getItem("userId");
    $scope.assignee = '';

    $scope.geofenceAlerts = '';

    $scope.tour = tour_data;

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
        $window.location.reload(true);
      }, function(errMsg) {
        // error handling
      });

    };

    $scope.$on("$stateChangeSuccess", function() {

      var route_icons = {
        default_icon: {},
        start_icon: {
          iconUrl: 'img/map-start.png',
          iconSize:     [38, 38], // size of the icon
          iconAnchor:   [19, 38], // point of the icon which will correspond to marker's location
        },
        end_icon: {
          iconUrl: 'img/map-end.png',
          iconSize:     [38, 38], // size of the icon
          iconAnchor:   [19, 38], // point of the icon which will correspond to marker's location
        },
        location_icon: {
          iconUrl: 'img/map-location.png',
          iconSize:     [38, 38], // size of the icon
          iconAnchor:   [19, 38], // point of the icon which will correspond to marker's location
        }
      };

      var startMarker = {
        lat: parseFloat($scope.tour.route.drivenRoute.gpsLatitude[0]),
        lng: parseFloat($scope.tour.route.drivenRoute.gpsLongitude[0]),
        icon: route_icons.start_icon,
        focus: false,
        draggable: false};

      var endMarker = {
        lat: parseFloat($scope.tour.route.drivenRoute.gpsLatitude[$scope.tour.route.drivenRoute.gpsLatitude.length-1]),
        lng: parseFloat($scope.tour.route.drivenRoute.gpsLongitude[$scope.tour.route.drivenRoute.gpsLongitude.length-1]),
        icon: route_icons.end_icon,
        focus: false,
        draggable: false};

      var geofenceMarker = {
        lat: parseFloat($scope.tour.geofenceValue.latitude),
        lng: parseFloat($scope.tour.geofenceValue.longitude),
        icon: route_icons.location_icon,
        focus: false,
        draggable: false};

      $scope.map = {
        center: {
          lat : parseFloat($scope.tour.route.drivenRoute.gpsLatitude[0]),
          lng : parseFloat($scope.tour.route.drivenRoute.gpsLongitude[0]),
          zoom : 13},
        markers: {
          startMarker: angular.copy(startMarker),
          endMarker: angular.copy(endMarker),
          geofenceMarker: angular.copy(geofenceMarker)}
      };

      $scope.paths = {
        route: {
          latlngs: [],
          color: '#0c60ee',
          weight: 10,
          clickable: false,
          focus: true
        },
        circle: {
          type: 'circle',
          radius: parseFloat($scope.tour.geofenceValue.radius),
          latlngs: $scope.map.markers.geofenceMarker,
          color: '#0c60ee',
          weight: 4,
          fillColor: '#387ef5',
          fillOpacity: 0.3,
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
      var speedShoot;
      var speedMax = 0;

      for (var i = 0; i < $scope.tour.route.speed.length; i++) {
        speedShoot = parseInt($scope.tour.route.speed[i]);
        speedData.push(speedShoot);
        speedFence.push(parseInt($scope.tour.speedfenceValue));
        speedLabel.push('');
        if (speedShoot > speedMax) {
          speedMax = speedShoot;
        }

      }

      $scope.chartData = {
        labels: speedLabel,
        series: ['Speedfence: ' + speedFence[0] + ' km/h', 'Speed (Max: ' + speedMax + ' km/h)'],
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

  /*
  // ECO-SCORES
  .controller('ScoresCtrl', function($scope) {

    $scope.labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    $scope.series = ['Gordon', 'Barney'];
    $scope.data = [
      [87, 85, 80, 81, 76, 88, 85],
      [76, 77, 86, 84, 83, 80, 77]
    ];


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

  // ECO-SCORES WEEKLY
  .controller('ScoresWeeklyCtrl', function($scope, $location, $ionicNavBarDelegate) {
    var path = $location.path();
    if (path.indexOf('weekly') != -1)
      $ionicNavBarDelegate.showBackButton(false);
    else
      $ionicNavBarDelegate.showBackButton(true);

    $scope.labels = ["KW 1", "KW 2", "KW 3", "KW 4", "KW 5"];
    $scope.series = ['Gordon', 'Barney'];
    $scope.data = [
      [85, 86, 84, 81, 82],
      [76, 77, 86, 84, 80]
    ];

  })

  // ECO-SCORES MONTHLY
  .controller('ScoresMonthlyCtrl', function($scope, $location, $ionicNavBarDelegate) {
    var path = $location.path();
    if (path.indexOf('monthly') != -1)
      $ionicNavBarDelegate.showBackButton(false);
    else
      $ionicNavBarDelegate.showBackButton(true);

    $scope.labels = ["Aug", "Sep", "Okt", "Nov", "Dec", "Jan", "Feb"];
    $scope.series = ['Gordon', 'Barney'];
    $scope.data = [
      [86, 85, 83, 82, 76, 83, 85],
      [80, 78, 84, 84, 83, 80, 77]
    ];

  })
  */

  // ALERTS
  .controller('AlertsCtrl', function($scope, AlertService) {
    $scope.role = localStorage.getItem("role");
    $scope.ownAlerts = localStorage.getItem("userId");

    $scope.doRefresh = function() {
      AlertService.getAlerts(localStorage.getItem("vehicleId")).then(function (data) {
        $scope.alerts = data;
        $scope.alertCounter = 0;
        localStorage.setItem("alertsCounter", $scope.alertCounter);

        for (var i = 0; i < data.length; i++) {

          if (localStorage.getItem("role") == 'master' && data[i].readStatusMaster == false) {
            $scope.alertCounter++;
            localStorage.setItem("alertsCounter", $scope.alertCounter);
          } else if (localStorage.getItem("role") == 'child' && $scope.alerts[i].userId == localStorage.getItem("userId") && $scope.alerts[i].readStatusChild == false) {
            $scope.alertCounter++;
            localStorage.setItem("alertsCounter", $scope.alertCounter);
          }

        };
      }, function (errMsg) {
        // error handling
      }).then(function(){
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.doRefresh();

    $scope.updateReadStatus = function(alertId) {

      $scope.role = localStorage.getItem("role");

      $scope.updatedAlert = {
        _id: alertId
      };

      if ($scope.role == 'master') {
        $scope.updatedAlert.readStatusMaster = true;

        AlertService.updateAlert($scope.updatedAlert).then(function() {
        }, function(errMsg) {
          // error handling
        })

      } else {
        $scope.updatedAlert.readStatusChild = true;

        AlertService.updateAlert($scope.updatedAlert).then(function() {
        }, function(errMsg) {
          // error handling
        })
      }

    };

    $scope.$on('$ionicView.enter', function() {
      $scope.doRefresh();
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

    $scope.doRefresh = function() {

      UserService.userInfo($scope.userId).then(function (user) {
        $scope.vin = user.vin;

        MemberService.getMembers($scope.vin).then(function (data) {
          $scope.members = data;

          // Save number of family members to local storage
          localStorage.setItem("familyCounter", data.length);

        }, function (errMsg) {
          // error handling
        });

      }, function (errMsg) {

      }).then(function(){
        $scope.$broadcast('scroll.refreshComplete');
      });

    };

    $scope.doRefresh();

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
        $scope.doRefresh();
        $scope.user = {};
      }, function(errMsg) {
        var alertPopup = $ionicPopup.alert({
          title: 'Signup failed!',
          template: errMsg
        });
      });
    };

    $scope.deleteMember = function() {
      var alertPopup = $ionicPopup.alert({
        title: 'Sorry!',
        template: 'Not implemented yet.'
      });
    };

    $ionicModal.fromTemplateUrl('modals/app/newFamilyMember.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalMember = modal;
    });

    $scope.$on('$ionicView.enter', function() {
      $scope.doRefresh();
    });

  })

  // FAMILY MEMBER
  .controller('FamilyMemberCtrl', function($rootScope, $scope, $state, $stateParams, geofence_data, UserService, GeoLocationService, GeofenceService, $ionicLoading, $ionicModal) {
    $scope.role = localStorage.getItem("role");
    $scope.memberId = $stateParams.memberId;

    $scope.user = {
      _id: $scope.memberId
    };

    $scope.geofence = geofence_data.geofence;

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

        // Set do local storage (for side menu)
        if (user._id == localStorage.getItem("userId")) {
          localStorage.setItem("geofenceActive", user.geofenceActive);
        }

        $scope.modalGeofence.hide();
      }, function(errMsg) {
        // error handling
      });

    };

    $scope.doSetSpeedfence = function() {
      UserService.updateUser($scope.user).then(function(user) {
        $scope.profile = user;

        // Set do local storage (for side menu)
        if (user._id == localStorage.getItem("userId")) {
          localStorage.setItem("speedfenceActive", user.geofenceActive);
        }

        $scope.modalSpeedfence.hide();
      }, function(errMsg) {
        // error handling
      });
    };

    $scope.$on("$stateChangeSuccess", function() {

      var map_icons = {
        default_icon: {},
        location_icon: {
          iconUrl: 'img/map-location.png',
          iconSize:     [38, 38], // size of the icon
          iconAnchor:   [19, 38], // point of the icon which will correspond to marker's location
        }
      };

      var mainMarker = {
        lat: parseFloat($scope.geofence.latitude),
        lng: parseFloat($scope.geofence.longitude),
        icon: map_icons.location_icon,
        focus: true,
        draggable: true};

      // disable dragging if not allowed
      if ($scope.role == 'child') {
        mainMarker.draggable = false;
      }

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
          radius: parseInt($scope.geofence.radius),
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

    $ionicModal.fromTemplateUrl('modals/family/editMember.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalMember = modal;
    });

    $ionicModal.fromTemplateUrl('modals/family/setGeofence.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalGeofence = modal;

      $scope.activeGeofence = localStorage.getItem("geofenceActive");

      $scope.activeGeofence = function(value) {
        $scope.user.geofenceActive = value;
      };


    });

    $ionicModal.fromTemplateUrl('modals/family/setSpeedfence.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalSpeedfence = modal;

      $scope.updateSpeedfence = function(sf) {
        $scope.user.speedfence = sf;
      };

      $scope.activeSpeedfence = function(value) {
        $scope.user.speedfenceActive = value;
      };

    });

  })

  // SETTINGS
  .controller('SettingsCtrl', function($scope, AuthService, $ionicPopup, $ionicHistory, $state, $window) {

    $scope.registerDevice = function() {

    };

    $scope.cleanCache = function() {
      /*
      var confirmPopup = $ionicPopup.confirm({
        title: 'Clean cache',
        template: 'Are you sure you want to clean cache?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $ionicHistory.clearHistory();
          $ionicHistory.clearCache();
        }
      });
      */
    };

    $scope.cleanLocalStorage = function() {
      /*
      var confirmPopup = $ionicPopup.confirm({
        title: 'Clean local storage',
        template: 'Are you sure you want to clean local storage?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          $window.localStorage.clear();
        }
      });
      */
    };

    $scope.reloadData = function() {

    };

    $scope.logout = function() {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Logout',
          template: 'Are you sure you want to logout?'
        });

        confirmPopup.then(function(res) {
          if(res) {
            AuthService.logout();
            $window.localStorage.clear();
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache().then(function(){
              $state.go('auth.check');
            })
          } else {

          }
        });
    };
  })

  // INFO
  .controller('InfoCtrl', function($scope, $state, AuthService, UserService, $ionicHistory, $ionicModal, $ionicPopup, $window, API_ENDPOINT) {
    $scope.userId = localStorage.getItem("userId");
    $scope.toursCounter = localStorage.getItem("toursCounter");
    $scope.familyCounter = localStorage.getItem("familyCounter");
    $scope.serverUrl = API_ENDPOINT.url;

    $scope.user = {
      _id: $scope.userId,
      termsOfUseAgreed: ''
    };

    //User disagrees Terms Of Use
    $scope.disagreeTermsOfUse= function() {
      $scope.user.termsOfUseAgreed = false;

      var confirmPopup = $ionicPopup.confirm({
        title: 'Logout',
        template: 'Are you sure you want to disagree to Terms of Use?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          UserService.updateUser($scope.user);
          $scope.modalTerms.hide();
          AuthService.logout();
          $window.localStorage.clear();
          $ionicHistory.clearHistory();
          $ionicHistory.clearCache().then(function(){
            $state.go('auth.check');
          })
        } else {

        }
      });

    };


    $ionicModal.fromTemplateUrl('modals/info/terms.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalTerms = modal;
    });

  })

  // STATISTICS
  .controller('StatisticsCtrl', function($scope, TourService, UserService) {
    $scope.userId = localStorage.getItem("userId");

    $scope.doRefresh = function() {

      //Method cleans double elements in an array
      var unique = function (origArr) {
        var newArr = [],
          origLen = origArr.length,
          found,
          x, y;

        for (x = 0; x < origLen; x++) {
          found = undefined;
          for (y = 0; y < newArr.length; y++) {
            if (origArr[x] === newArr[y]) {
              found = true;
              break;
            }
          }
          if (!found) newArr.push(origArr[x]);
        }
        return newArr;
      }

      //Method sums
      Array.prototype.sum = Array.prototype.sum || function () {
          return this.reduce(function (sum, a) {
            return sum + Number(a)
          }, 0);
        }

      //Method averages
      Array.prototype.average = Array.prototype.average || function () {
          return this.sum() / (this.length || 1);
        }

      //Array for the total Average of All EcoScore
      $scope.averageTotalEcoScore = new Array();
      //Array for the total Average of All FuelAverages
      $scope.averageTotalFuelAverage = new Array();
      //Array for the total Distances for every user
      $scope.totalDistance = new Array();
      //Array for the total Distances for every user
      $scope.totalFuelConsumption = new Array();
      //Array for the total Driving Time for every user
      $scope.totalDrivingTime = new Array();

      //Array for registered Users of a VIN
      $scope.users = [];

      // The following method:
      // 1. gets all Users of a VIN an pushes in Array $scope.users
      // 2. calculates the average of Total EcoScore for every user
      // 3. calculates the average of Total Fuel Consumption for every user
      // 4. sums the total distances for every user
      // 5. sums the total fuel consumption for every user
      // 6. fills the Array averageTotalEcoScore
      // 7. fills the Array averageTotalFuelAverage
      // 8. fills the Array totalDistance
      UserService.userInfo($scope.userId).then(function (user) {
        TourService.getTours(user.vin)
          .then(function (allTours) {
            $scope.tours = allTours;
            // Get "ALL" the available users, which are assigned to tours
            for (var i = 0; i < allTours.length; i++) {
              //console.log(allTours[i].userId);
              //console.log(allTours[i].ecoScoreTotal);
              //console.log(allTours[i].route.timestampStart.toString());
              $scope.users.push(allTours[i].userId);
            }
            //console.log("USERS " + $scope.users.length);
            //for (var i = 0; i < $scope.users.length; i++) {
            //console.log($scope.users[i]);
            //}
            //Delete double users
            $scope.users = unique($scope.users);
            //console.log("USERS " + $scope.users.length);
            //for (var i = 0; i < $scope.users.length; i++) {
            //console.log($scope.users[i]);
            //}

            //Get
            // 1. the total EcoScores
            // 2. the total fuelAverages,
            // 3. the total distances and
            // 4. the total fuel consumption
            // 5. the total duration
            // of the users
            for (var i = 0; i < $scope.users.length; i++) {
              ecoScores = new Array();
              fuelAverages = new Array();
              distances = new Array();
              fuelConsumption = new Array();
              drivingTime = new Array();

              for (var j = 0; j < allTours.length; j++) {
                if ($scope.users[i] == allTours[j].userId) {
                  if (allTours[j].ecoScoreTotal != 0) {
                    ecoScores.push(allTours[j].ecoScoreTotal)
                  }
                  if (allTours[j].fuelAverage != 0) {
                    fuelAverages.push(allTours[j].fuelAverage)
                  }
                  distances.push(allTours[j].route.routeDistance)
                  fuelConsumption.push(allTours[j].fuelTotal)
                  drivingTime.push(allTours[j].route.routeDuration)
                }
              }
              //fill averageTotalEcoScore-Array for bar-chart
              var ecoScoreAverage = ecoScores.average()
              $scope.averageTotalEcoScore[i] = new Array(1)
              $scope.averageTotalEcoScore[i][0] = ecoScoreAverage
              //fill averageTotalFuelAverage-Array for bar-chart
              var fuelAverage = fuelAverages.average()
              $scope.averageTotalFuelAverage[i] = new Array(1)
              $scope.averageTotalFuelAverage[i][0] = fuelAverage
              //fill totalDistance-Array for pie-chart
              var sumDistances = distances.sum()
              $scope.totalDistance[i] = parseFloat(sumDistances)
              //fill totalFuelConsumption-Array for pie-chart
              var sumFuelConsumptions = fuelConsumption.sum()
              $scope.totalFuelConsumption[i] = parseFloat(sumFuelConsumptions)
              //fill totalDrivingTime-Array for pie-chart. Divide /60 to get the minutes.
              var sumDrivingTime = drivingTime.sum()
              $scope.totalDrivingTime[i] = parseInt(sumDrivingTime) / 60

            }
            //Call the method to fill the charts
            fillCharts();
          })
          .then(function(){
            $scope.$broadcast('scroll.refreshComplete');
          });
      });

      function fillCharts() {
        for (var i = 0; i < $scope.averageTotalEcoScore.length; i++) {
          console.log($scope.users[i] + " : TOTAL-EcoScore " + $scope.averageTotalEcoScore[i]
            + ", TOTAL-FuelAverage " + $scope.averageTotalFuelAverage[i]
            + ", TOTAL-Distance " + $scope.totalDistance[i]
            + ", TOTAL-FuelConsumption " + $scope.totalFuelConsumption[i]
            + ", TOTAL-DrivingTime " + $scope.totalDrivingTime[i])
        }

        $scope.labels = ["Driver"];
        $scope.series = $scope.users;
        $scope.ecoScoreData = $scope.averageTotalEcoScore;
        $scope.consumptionFuelAverageData = $scope.averageTotalFuelAverage;
        $scope.tourSharesDistanceData = $scope.totalDistance;
        $scope.tourSharesFuelTotalData = $scope.totalFuelConsumption;
        $scope.tourSharesDrivingTimeData = $scope.totalDrivingTime;

      }

    };

    $scope.doRefresh();

  })

;
