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
  .service('TourService', function($rootScope, $http, $q) {

    this.getTours = function() {
      var deferred = $q.defer();

      $http.get('tours-sample.json')
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

      $http.get('tours-sample.json')
        .success(function(data) {
          var tours = data;
          tours.forEach(function(tour) {
            if (tour.timestamp === tourId) deferred.resolve(tour)
          });
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };


  })

  // USER SERVICE
  .service('UserService', function($http, $q, API_ENDPOINT) {

    var userinfo = function(userId) {
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

    return {
      userinfo: userinfo
    };

  })

;
