angular.module('cyfclient.services', [])

  // AUTH SERVICE
  .service('AuthService', function($q, $http, API_ENDPOINT) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var isAuthenticated = false;
    var authToken;

    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
      }
    }

    function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }

    function useCredentials(token) {
      isAuthenticated = true;
      authToken = token;

      // Set the token as header for your requests!
      $http.defaults.headers.common.Authorization = authToken;
    }

    function destroyUserCredentials() {
      authToken = undefined;
      isAuthenticated = false;
      $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

    var register = function(user) {
      return $q(function(resolve, reject) {
        $http.post(API_ENDPOINT.url + '/users/signup', user).then(function(result) {
          if (result.data.success) {
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        });
      });
    };

    var registerMember = function(user) {
      return $q(function(resolve, reject) {
        $http.post(API_ENDPOINT.url + '/users/family', user).then(function(result) {
          if (result.data.success) {
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        });
      });
    };

    var login = function(user) {
      return $q(function(resolve, reject) {
        $http.post(API_ENDPOINT.url + '/users/auth', user).then(function(result) {
          if (result.data.success) {
            storeUserCredentials(result.data.token);
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        });
      });
    };

    var logout = function() {
      destroyUserCredentials();
    };

    loadUserCredentials();

    return {
      login: login,
      register: register,
      registerMember: registerMember,
      logout: logout,
      isAuthenticated: function() {return isAuthenticated;},
    };
  })

  .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    return {
      responseError: function (response) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated,
        }[response.status], response);
        return $q.reject(response);
      }
    };
  })

  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  })


  // TOUR SERVICE
  .service('TourService', function($rootScope, $http, $q, API_ENDPOINT) {

    this.getTours = function(vehicleId) {

      var deferred = $q.defer();

      $http.get(API_ENDPOINT.url + '/tours/family/' + vehicleId)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;

    };

    this.getTour = function(tourId) {
      var deferred = $q.defer();

      $http.get(API_ENDPOINT.url + '/tours/' + tourId)
        .success(function(data) {
          deferred.resolve(data)
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

    this.updateTour = function(tour) {
      var deferred = $q.defer();

      $http.put(API_ENDPOINT.url + '/tours/update/' + tour._id, tour)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

  })

  // VEHICLE SERVICE
  .service('VehicleService', function($rootScope, $http, $q, API_ENDPOINT) {

    this.getVehicles = function() {
      var deferred = $q.defer();

      $http.get(API_ENDPOINT.url + '/vehicles')
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

    this.getVehicle = function(vehicleId) {
      var deferred = $q.defer();

      $http.get(API_ENDPOINT.url + '/vehicles/' + vehicleId)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

    this.getVehiclesOfReadiConnect = function() {
      var deferred = $q.defer();

      $http.get(API_ENDPOINT.url + '/vehicles/readi')
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

    this.checkVin = function(vin) {
      return $q(function(resolve, reject) {
        $http.get(API_ENDPOINT.url + '/vehicles/readi/' + vin).then(function(result) {
          if (result.data.success) {
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        });
      });
    };

    this.createVehicle = function(vehicle) {
      return $q(function(resolve, reject) {
        $http.post(API_ENDPOINT.url + '/vehicles', vehicle).then(function(result) {
          if (result.data.success) {
            resolve(result.data.msg);
          } else {
            reject(result.data.msg);
          }
        });
      });
    };

  })

  // USER SERVICE
  .service('UserService', function($http, $q, API_ENDPOINT) {

    var userInfo = function(userId) {
      return $q(function(resolve, reject) {
        $http.get(API_ENDPOINT.url + '/users/' + userId).then(function(result) {
          if (result.data) {
            resolve(result.data);
          } else {
            reject(result.data.msg);
          }

        });
      });
    };

    var updateUser = function(user) {
      return $q(function(resolve, reject) {
        $http.put(API_ENDPOINT.url + '/users/update/' + user._id, user).then(function(result) {
          if (result.data) {
            resolve(result.data);
          } else {
            reject(result.data.msg);
          }

        });
      });
    };

    return {
      userInfo: userInfo,
      updateUser: updateUser
    };

  })

  // MEMBER SERVICE
  .service('MemberService', function($rootScope, $http, $q, API_ENDPOINT) {

    this.getMembers = function(vehicleId) {
      var deferred = $q.defer();

      $http.get(API_ENDPOINT.url + '/users/family/' + vehicleId)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

  })

  // GEOLOCATION SERVICE
  .factory('GeoLocationService', function ($q, $timeout) {
    var currentPositionCache;
    return {
      getCurrentPosition: function () {
        if (!currentPositionCache) {
          var deffered = $q.defer();
          navigator.geolocation.getCurrentPosition(function (position) {
            deffered.resolve(currentPositionCache = position);
            $timeout(function () {
              currentPositionCache = undefined;
            }, 10000);
          }, function () {
            deffered.reject();
          });
          return deffered.promise;
        }
        return $q.when(currentPositionCache);
      }
    };
  })

  // GEOFENCE SERVICE
  .factory('GeofenceService', function ($rootScope, $window, $q, $log, $ionicLoading) {

    $window.geofence = $window.geofence || {
        addOrUpdate: function (fences) {
          var deffered = $q.defer();
          $log.log('Mocked geofence plugin addOrUpdate', fences);
          deffered.resolve();
          return deffered.promise;
        },
        remove: function (ids) {
          var deffered = $q.defer();
          $log.log('Mocked geofence plugin remove', ids);
          deffered.resolve();
          return deffered.promise;
        },
        removeAll: function () {
          var deffered = $q.defer();
          $log.log('Mocked geofence plugin removeAll');
          deffered.resolve();
          return deffered.promise;
        },
        initialize: function () {},
        receiveTransition: function () {}
      };
    $window.TransitionType = $window.TransitionType || {
        ENTER: 1,
        EXIT: 2,
        BOTH: 3
      };

    var geofenceService = {
      _geofences: [],
      _geofencesPromise: null,
      createdGeofenceDraft: null,
      loadFromLocalStorage: function () {
        var result = localStorage['geofences'];
        var geofences = [];
        if (result) {
          try {
            geofences = angular.fromJson(result);
          } catch (ex) {

          }
        }
        this._geofences = geofences;
        return $q.when(this._geofences);
      },
      saveToLocalStorage: function () {
        localStorage['geofences'] = angular.toJson(this._geofences);
      },
      loadFromDevice: function () {
        var self = this;
        if ($window.geofence && $window.geofence.getWatched) {
          return $window.geofence.getWatched().then(function (geofencesJson) {
            self._geofences = angular.fromJson(geofencesJson);
            return self._geofences;
          });
        }
        return this.loadFromLocalStorage();
      },
      addOrUpdate: function (geofence) {
        var self = this;
        $window.geofence.addOrUpdate(geofence).then(function () {
          if ((self.createdGeofenceDraft && self.createdGeofenceDraft === geofence) ||
            !self.findById(geofence.id)) {
            self._geofences.push(geofence);
            self.saveToLocalStorage();
          }

          if (self.createdGeofenceDraft) {
            self.createdGeofenceDraft = null;
          }
        });

      },
      findById: function (id) {
        if (this.createdGeofenceDraft && this.createdGeofenceDraft.id === id) {
          return this.createdGeofenceDraft;
        }
        var geoFences = this._geofences.filter(function (g) {
          return g.id === id;
        });
        if (geoFences.length > 0) {
          return geoFences[0];
        }
        return undefined;
      },
      remove: function (geofence) {
        var self = this;
        $ionicLoading.show({
          template: 'Removing geofence...'
        });
        $window.geofence.remove(geofence.id).then(function () {
          $ionicLoading.hide();
          self._geofences.splice(self._geofences.indexOf(geofence), 1);
          self.saveToLocalStorage();
        }, function (reason) {
          $log.log('Error while removing geofence', reason);
          $ionicLoading.show({
            template: 'Error',
            duration: 1500
          });
        });
      },
      removeAll: function () {
        var self = this;
        $ionicLoading.show({
          template: 'Removing all geofences...'
        });
        $window.geofence.removeAll().then(function () {
          $ionicLoading.hide();
          self._geofences.length = 0;
          self.saveToLocalStorage();
        }, function (reason) {
          $log.log('Error while removing all geofences', reason);
          $ionicLoading.show({
            template: 'Error',
            duration: 1500
          });
        });
      }
    };

    return geofenceService;
  })

  // ALERT SERVICE
  .service('AlertService', function($rootScope, $http, $q, API_ENDPOINT) {

    this.getAlerts = function(vehicleId) {
      var deferred = $q.defer();

      $http.get(API_ENDPOINT.url + '/alerts/family/' + vehicleId)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

    this.updateAlert = function(alert) {
      var deferred = $q.defer();

      $http.put(API_ENDPOINT.url + '/alerts/update/' + alert._id, alert)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

  })

;
