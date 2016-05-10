'use strict';

/**
 * @ngdoc function
 * @name rvApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rvApp
 */
angular.module('rvApp')
  .controller('MainCtrl', function ($log) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $log.log('Controller: MainCtrl');
  });
