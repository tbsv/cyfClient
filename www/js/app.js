// Ionic cyfclient App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'cyfclient' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('cyfclient', [
  'ionic',
  'cyfclient.constants',
  'cyfclient.controllers',
  'cyfclient.directives',
  'cyfclient.services',
  'chart.js',
  'ionic-letter-avatar',
  'leaflet-directive',
  'jett.ionic.filter.bar'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // AUTHENTICATION
    .state('auth', {
      url: "/auth",
      templateUrl: "templates/auth/auth.html",
      abstract: true,
      controller: 'AuthCtrl'
    })

    .state('auth.check', {
      url: '/check',
      templateUrl: "templates/auth/check.html"
    })

    .state('auth.login', {
      url: '/login',
      templateUrl: "templates/auth/login.html",
      controller: 'LoginCtrl'
    })

    .state('auth.signup', {
      url: '/signup',
      templateUrl: "templates/auth/signup.html",
      controller: 'SignupCtrl'
    })

    .state('auth.forgot-password', {
      url: "/forgot-password",
      templateUrl: "templates/auth/forgot-password.html",
      controller: 'ForgotPasswordCtrl'
    })

    .state('auth.enroll', {
      url: '/enroll',
      templateUrl: "templates/auth/enroll.html",
      controller: 'EnrollCtrl'
    })

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/app/side-menu.html",
      controller: 'MenuCtrl'
    })

    // OVERVIEW
    .state('app.overview', {
      url: "/overview",
      views: {
        'menuContent': {
          templateUrl: "templates/app/overview.html",
          controller: 'OverviewCtrl'
        }
      }
    })

    // OVERVIEW WEEKLY
    .state('app.overview.weekly', {
      url: "/overview/weekly.html",
      views: {
        'weekly-tab': {
          templateUrl: "templates/overview/weekly.html",
          controller: 'OverviewWeeklyCtrl'
        }
      }
    })

    // OVERVIEW MONTHLY
    .state('app.overview.monthly', {
      url: "/overview/monthly.html",
      views: {
        'monthly-tab': {
          templateUrl: "templates/overview/monthly.html",
          controller: 'OverviewMonthlyCtrl'
        }
      }
    })

    // TOURS
    .state('app.tours', {
      url: "/tours",
      views: {
        'menuContent': {
          templateUrl: "templates/tours/tours.html",
          controller: 'ToursCtrl'
        }
      }
    })

    // TOUR
    .state('app.tour', {
      url: "/tours/:tourId",
      views: {
        'menuContent': {
          templateUrl: "templates/tours/tour.html",
          controller: 'TourCtrl'
        }
      },
      resolve: {
        tour_data: function(TourService, $stateParams) {
          var tourId = $stateParams.tourId;
          return TourService.getTour(tourId);
        }
      }
    })

    // ECO-SCORES
    .state('app.scores', {
      url: "/scores",
      views: {
        'menuContent': {
          templateUrl: "templates/app/scores.html",
          controller: 'ScoresCtrl'
        }
      }
    })

    // ALERTS
    .state('app.alerts', {
      url: "/alerts",
      views: {
        'menuContent': {
          templateUrl: "templates/app/alerts.html",
          controller: 'AlertsCtrl'
        }
      }
    })

    // PROFILE
    .state('app.profile', {
      url: "/profile",
      views: {
        'menuContent': {
          templateUrl: "templates/app/profile.html",
          controller: 'ProfileCtrl'
        }
      }
    })

    // FAMILY
    .state('app.family', {
      url: "/family",
      views: {
        'menuContent': {
          templateUrl: "templates/family/family.html",
          controller: 'FamilyCtrl'
        }
      }
    })

    // FAMILY MEMBER
    .state('app.familyMember', {
      url: "/family/:memberId",
      views: {
        'menuContent': {
          templateUrl: "templates/family/familyMember.html",
          controller: 'FamilyMemberCtrl'
        }
      },
      resolve: {
        geofence_data: function (UserService, $stateParams) {
          return UserService.userInfo($stateParams.memberId);
        }
      }
    })

    // SETTINGS
    .state('app.settings', {
      url: "/settings",
      views: {
        'menuContent': {
          templateUrl: "templates/app/settings.html",
          controller: 'SettingsCtrl'
        }
      }
    })

    // INFO
    .state('app.info', {
      url: "/info",
      views: {
        'menuContent': {
          templateUrl: "templates/app/info.html",
          controller: 'InfoCtrl'
        }
      }
    })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/auth/check');

})

  .filter('secondsToHHmmss', function($filter) {
    return function(seconds) {
      return $filter('date')(new Date(0, 0, 0).setSeconds(seconds), 'HH:mm:ss');
    };
  })

  /*
  .run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
    $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
      if (!AuthService.isAuthenticated()) {
        console.log(next.name);
        if (next.name !== 'auth.login' && next.name !== 'auth.register') {
          event.preventDefault();
          $state.go('auth.check');
        }
      }
    });
  })
  */

;
