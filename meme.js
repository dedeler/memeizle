angular.module('meme', ['ngRoute'])

.constant('DB_URL', 'https://api.mongolab.com/api/1/databases/memetabani/collections/memeler?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs&q={"id":{$ID}}')
.constant('COUNT_URL', 'https://api.mongolab.com/api/1/databases/memetabani/collections/memeler?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs&c=true')

//https://api.mongolab.com/api/1/databases/memetabani/collections/memeler?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs&c=true
//https://api.mongolab.com/api/1/databases/memetabani/collections/memeler?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs&q={"id":{$ID}}

.factory('meme.service.db', ['DB_URL', 'COUNT_URL', '$http', function(DB_URL, COUNT_URL, $http) {
  return {
    get: function(id) {
      return $http.get(DB_URL.replace('{$ID}', id));
    },
    count: function() {
      return $http.get(COUNT_URL);
    }
  };
}])

.factory('meme.service.random', [function() {
  return {
    get: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  };
}])

.controller('meme.ctrl.content', ['$scope', '$rootScope', '$q', '$location', 'meme.service.db', 'meme.service.random',
function($scope, $rootScope, $q, $location, db, random) {
  function treatAsFinished () {
    $scope.$apply(function() {
      $scope.progressPerCent = 100;
      $scope.loading = false;
    });
  }

  $rootScope.$watch('id', function(newId, oldId) {
    if(newId && newId != oldId){
      db.get(newId)
      .success(function(response, status) {
        if(status == 200){
          $scope.progressPerCent = 90;
          if(response == null || response.length == 0) {
            $scope.anotherSister();
          } else {
            $scope.prev = response[0].id;
            $scope.memeUrl = response[0].url;
  
            // fuck directives this is the way to go :P
            $('#meme img')
            .off('load').on('load', function() {
              treatAsFinished()
            })
            .off('error').on('error', function() {
              console.error('meme yok');
              treatAsFinished()
            });
            setTimeout(function() {
              console.warn('meme cok buyuk');
              treatAsFinished();
            }, 5000);
          }
        }
      });
    }
  }, true);


  $scope.anotherSister = function(event) {
    $scope.loading = true;
    $scope.progressPerCent = 0;
    while( (newId = random.get(1, $rootScope.count)) == $scope.prev ){}//ensure won't be the same as previous

    $location.path('/meme/' + newId);
  }
}])

.controller('meme.ctrl.routing', ['$scope', '$rootScope','$routeParams', '$location', '$q', 'meme.service.random', 'meme.service.db',
function ($scope, $rootScope, $routeParams, $location, $q, random, db) {
  var deferred = $q.defer();

  $rootScope.progressPerCent = 10;
  if(!$rootScope.count){
    db.count()
    .success(function(count, status) {
      if(status == 200){
        $rootScope.count = count;
        deferred.resolve(count);
      }
    });
  }
  else{
    deferred.resolve($rootScope.count);
  }

  deferred.promise.then(function(count) {
    $rootScope.progressPerCent = 30;
    if($routeParams.id){
      $rootScope.id = $routeParams.id;
    }
    else{
      while( (newId = random.get(1, $rootScope.count)) == $scope.prev ){}//ensure won't be the same as previous
      $location.path('/meme/' + newId);
    }
  });
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {controller: 'meme.ctrl.routing', template:' '})
    .when('/meme/:id', {controller: 'meme.ctrl.routing', template:' '})
    .otherwise({redirectTo:'/'});
}]);
