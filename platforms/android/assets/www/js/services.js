angular.module('cyfclient.services', [])

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

      /*
      this.TourService.getTours()
        .then(function(data){
          var tours = data;
          tours.forEach(function(tour) {
            if (tour.timestamp === tourId) deferred.resolve(tour)
          });
        });

      return deferred.promise;
      */
    };


  })

;
