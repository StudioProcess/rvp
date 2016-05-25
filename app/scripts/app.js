import MainCtrl from './controllers/main';
import dbFactory from './services/db';

/**
 * @ngdoc overview
 * @name rvApp
 * @description
 * # rvApp
 *
 * Main module of the application.
 */
let app = angular.module('rvApp', []);

/**
 * Controllers
 */
app.controller('MainCtrl', MainCtrl);

/**
 * Services
 */
app.factory('db', dbFactory);
