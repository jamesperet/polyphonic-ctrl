'use strict';

/**
 * @ngdoc overview
 * @name infernoQuadrifonicoApp
 * @description
 * # infernoQuadrifonicoApp
 *
 * Main module of the application.
 */
angular
  .module('infernoQuadrifonicoApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularAwesomeSlider',
    'ngStorage'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'public/scripts/views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'public/scripts/views/player.html',
        controller: 'PlayerCtrl',
        controllerAs: 'player'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
