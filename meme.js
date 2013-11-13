/*
This file is part of memeizle.

memeizle is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

memeizle is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with memeizle.  If not, see <http://www.gnu.org/licenses/>.
*/

angular.module('meme', ['ngRoute'])

.constant('DB_URL', 'https://data-api.mongolab.com/v2/apis/41inadkv90f96/collections/memeler_yeni/documents?q={"id":{$ID}}')
.constant('COUNT_URL', 'https://data-api.mongolab.com/v2/apis/41inadkv90f96/collections/memeler_yeni/documents?count=true')
.constant('SUGGEST_URL', 'https://data-api.mongolab.com/v2/apis/6qgesmf1o46jp/collections/memeadayi/documents')

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
      if($scope.memeUrl.indexOf('loading.gif') == -1){
        $scope.progressPerCent = 100;
        $scope.loading = false;
      }
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

  //do not try on your project, this is dirty as the site...
  $( document ).off('keypress').on('keypress', function(e){
    // console.log(e.keyCode);
    if(e.which == 32){//space key
      $scope.$apply(function() {
        $scope.anotherSister();
      });
      e.preventDefault();
      return false;
    }
    else if(e.which == 120 || e.which == 88){//x or X key
      $('#cover').toggle();
    }
  });

  $scope.anotherSister = function(event) {
    $scope.loading = true;
    $scope.progressPerCent = 0;
    $scope.memeUrl = 'loading.gif';
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

.controller('meme.ctrl.suggest', ['$scope', '$rootScope', 'SUGGEST_URL',
function ($scope, $rootScope, SUGGEST_URL) {
  $scope.suggest = function(event) {
    if(!$scope.form.$valid){
      return
    }

    $scope.sending = true;
    var data = {
      url: $scope.url
    };

    $.ajax({
      type: "POST",
      url: SUGGEST_URL,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      success: function(response, status) {
        $scope.sending = false;
        $scope.url = '';
        alert('Teşekkürler, bi bakalım biz sizi ararız...');
      },
      error: function() {
        $scope.sending = false;
        alert('Everything is something happened. Bu kez olmadı başka sefere inş.');
      }
    });
  }
}])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {controller: 'meme.ctrl.routing', template:' '})
    .when('/meme/:id', {controller: 'meme.ctrl.routing', template:' '})
    .otherwise({redirectTo:'/'});

  $locationProvider.hashPrefix('!');

}])

.run(['$rootScope', function($rootScope) {
  $rootScope.$on('$routeChangeSuccess', function(event, route) {
    if(typeof DISQUS != 'undefined'){
      DISQUS.reset({
        reload: true,
        config: function () {  
          this.page.identifier = window.location.hash;  
          this.page.url = window.location.href;
        }
      });
    }

    if(typeof twttr != 'undefined'){
      $('#meme').find('iframe').replaceWith('<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+window.location.href+'" data-text="Bu memeyi görmelisiniz" data-via="memeizle" data-lang="tr" data-size="large">Meme izle</a>').remove();
      twttr.widgets.load();
    }
  });
}])

;
