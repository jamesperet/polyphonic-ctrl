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
        templateUrl: 'public/scripts/views/start.html',
        controller: 'StartCtrl',
        controllerAs: 'start'
      })
      .when('/controller', {
        templateUrl: 'public/scripts/views/controller.html',
        controller: 'ControllerCtrl',
        controllerAs: 'controller'
      })
      .when('/player', {
        templateUrl: 'public/scripts/views/player.html',
        controller: 'PlayerCtrl',
        controllerAs: 'player'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
